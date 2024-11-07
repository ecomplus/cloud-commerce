import type {
  Orders,
  Applications,
  ResourceListResult,
  ResourceId,
} from '@cloudcommerce/types';
import type { Request, Response } from 'firebase-functions/v1';
import api from '@cloudcommerce/api';
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import { parseStatus, parsePeriodicityToEcom, gerateId } from '../all-parses';
import GalaxpayAxios from './auth/create-access';
import { updateValueSubscription, checkAmountItemsOrder } from './update-subscription';

type FinancialStatusCurrent = Exclude<Orders['financial_status'], undefined>['current']

const collectionSubscription = getFirestore().collection('galaxpaySubscriptions');

const getApp = async (): Promise<Applications> => {
  return new Promise((resolve, reject) => {
    api.get(
      `applications?app_id=${config.get().apps.galaxPay.appId}&fields=hidden_data`,
    )
      .then(({ data: result }) => {
        resolve(result[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const checkStatusIsEqual = (
  financialStatus: Exclude<Orders['financial_status'], undefined>,
  galaxPayTransactionStatus?: string,
) => {
  if (financialStatus.current === parseStatus(galaxPayTransactionStatus)) {
    return true;
  }
  return false;
};

const checkStatusPaid = (status?: string) => {
  const parsedStatus = parseStatus(status);
  logger.log(`>> Status is ${status} => ${parsedStatus}`);
  if (parsedStatus === 'paid') {
    return true;
  }
  return false;
};

const checkPayDay = (strDate: string) => {
  // check if today is 3 days before payday.
  const payDay = new Date(strDate);
  const nowTime = new Date().getTime() + 259200000; // add 3day to today
  const now = new Date(nowTime);
  return (now >= payDay);
};

const findOrderByTransactionId = (transactionId: string): Promise<ResourceListResult<'orders'>> => {
  return new Promise((resolve, reject) => {
    api.get(`orders?transactions._id=${transactionId}`)
      .then(({ data: response }) => {
        const resp = response as unknown as ResourceListResult<'orders'>; // TODO:
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const findOrderById = async (orderId: ResourceId): Promise<Orders> => new Promise((resolve) => {
  api.get(`orders/${orderId}`)
    .then(({ data: order }) => {
      resolve(order);
    });
});

const createTransaction = async (
  res: Response,
  subscriptionLabel: string,
  plan: { [x: string]: any },
  orderNumber: string,
  galaxpayFristTransactionId: string,
  GalaxPayTransaction: { [x: string]: any },
  GalaxPaySubscription: { [x: string]: any },
  GalaxPayTransactionValue: number,
  originalOrderId: ResourceId,
) => {
  if (galaxpayFristTransactionId !== GalaxPayTransaction.galaxPayId) {
    // let body;
    const originalOrder = (await api.get(`orders/${originalOrderId}`)).data;

    // logger.log('> Create new Order ')
    if (originalOrder.transactions && originalOrder.items) {
      const { installment } = GalaxPayTransaction;
      const {
        buyers, items, domain, amount,
      } = originalOrder;
      const channelType = originalOrder.channel_type;
      const shippingLines = originalOrder.shipping_lines;
      const shippingMethodLabel = originalOrder.shipping_method_label;
      const paymentMethodLabel = originalOrder.payment_method_label;
      const originalTransaction = originalOrder.transactions[0];
      const quantity = installment;
      const periodicity = parsePeriodicityToEcom(GalaxPaySubscription.periodicity);
      const dateUpdate = GalaxPayTransaction.datetimeLastSentToOperator
        ? new Date(GalaxPayTransaction.datetimeLastSentToOperator).toISOString()
        : new Date().toISOString();

      // remove items free in new orders subscription
      checkAmountItemsOrder(amount, items, plan);
      if (amount.balance) {
        delete amount.balance;
      }

      const transactionId = String(gerateId(GalaxPayTransaction.galaxPayId));

      const transactions: Orders['transactions'] = [
        {
          amount: originalTransaction.amount,
          status: {
            updated_at: dateUpdate,
            current: parseStatus(GalaxPayTransaction.status),
          },
          intermediator: {
            transaction_id: GalaxPayTransaction.tid || '',
            transaction_code: GalaxPayTransaction.authorizationCode || '',
          },
          payment_method: originalTransaction.payment_method,
          app: originalTransaction.app,
          _id: transactionId as ResourceId,
          notes: `Parcela #${quantity} referente à ${subscriptionLabel} ${periodicity}`,
          custom_fields: originalTransaction.custom_fields,
        },
      ];

      transactions[0].payment_link = GalaxPaySubscription.paymentLink;

      const financialStatus = {
        updated_at: dateUpdate,
        current: parseStatus(GalaxPayTransaction.status) as FinancialStatusCurrent,
      };
      const body = {
        opened_at: new Date().toISOString(),
        items,
        shipping_lines: shippingLines,
        buyers,
        channel_type: channelType,
        domain,
        amount,
        shipping_method_label: shippingMethodLabel,
        payment_method_label: paymentMethodLabel,
        transactions,
        financial_status: financialStatus,
        subscription_order: {
          _id: originalOrderId as string & { length: 24 },
          number: parseInt(orderNumber, 10),
        },
        notes: `Pedido #${quantity} referente à ${subscriptionLabel} ${periodicity}`,
        staff_notes: `Valor cobrado no GalaxPay R$${GalaxPayTransactionValue}`,
      };

      const { result } = await findOrderByTransactionId(transactionId);

      if (!result.length) {
        await api.post('orders', body);
        // logger.log('> Created new order API')
        return res.sendStatus(200);
      }
      // Order Exists
      return res.sendStatus(200);
    }
  }
  // logger.log('> Not Found Subscritpion or Transaction exists')
  return res.sendStatus(404);
};

const handleWehook = async (req: Request, res: Response) => {
  // https://docs.galaxpay.com.br/webhooks

  // POST transaction.updateStatus update Transation status
  // POST subscription.addTransaction add transation in subscription

  const galaxpayHook = req.body;
  const type = galaxpayHook.event;
  const GalaxPaySubscription = galaxpayHook.Subscription;
  const GalaxPaySubscriptionQuantity = GalaxPaySubscription.quantity;
  const originalOrderId = GalaxPaySubscription.myId;
  const GalaxPayTransaction = galaxpayHook.Transaction;
  const GalaxPayTransactionValue = GalaxPayTransaction.value / 100;

  logger.log(
    `> (App GalaxPay) WebHook ${type}, Body ${JSON.stringify(galaxpayHook)}, quantity:
    ${GalaxPaySubscriptionQuantity}, status: ${GalaxPayTransaction.status} <`,
  );

  try {
    if (type === 'transaction.updateStatus') {
      const documentSnapshot = await collectionSubscription.doc(originalOrderId).get();
      if (documentSnapshot && documentSnapshot.exists) {
        const docSubscription = documentSnapshot.data();
        if (docSubscription) {
          const {
            galaxpayFristTransactionId,
            plan,
            orderNumber,
            subscriptionLabel,
          } = docSubscription.data();

          let galaxPayTransactionStatus: string | undefined;
          let galaxpaySubscriptionStatus: string | undefined;
          let transactionCreatedAt: string | undefined;
          const app = await getApp();

          try {
            // check subscription and transaction status before in galaxpay
            if (!process.env.GALAXPAY_ID) {
              const galaxpayId = app.hidden_data?.galaxpay_id;
              if (typeof galaxpayId === 'string' && galaxpayId) {
                process.env.GALAXPAY_ID = galaxpayId;
              } else {
                logger.warn('Missing GalaxPay ID');
              }
            }

            if (!process.env.GALAXPAY_HASH) {
              const galaxpayHash = app.hidden_data?.galaxpay_hash;
              if (typeof galaxpayHash === 'string' && galaxpayHash) {
                process.env.GALAXPAY_HASH = galaxpayHash;
              } else {
                logger.warn('Missing GalaxPay Hash');
              }
            }

            const galaxpayAxios = new GalaxpayAxios({
              galaxpayId: process.env.GALAXPAY_ID,
              galaxpayHash: process.env.GALAXPAY_HASH,
            });
            await galaxpayAxios.preparing;

            if (galaxpayAxios.axios) {
              let { data } = await galaxpayAxios.axios
                .get(`/transactions?galaxPayIds=${GalaxPayTransaction.galaxPayId}&startAt=0&limit=1`);

              galaxPayTransactionStatus = data.Transactions[0]?.status;
              const dateTimeTransaction = data.Transactions[0]?.createdAt;
              transactionCreatedAt = dateTimeTransaction && new Date(`${dateTimeTransaction} UTC-3`);
              logger.log(`>> Transaction status: ${galaxPayTransactionStatus}`);

              data = (await galaxpayAxios.axios
                .get(`/subscriptions?myIds=${originalOrderId}&startAt=0&limit=1`)).data;

              galaxpaySubscriptionStatus = data.Subscriptions[0]?.status;
              logger.log(`>> Subscription status: ${galaxpaySubscriptionStatus}`);
            }
          } catch (err: any) {
            logger.warn(`galaxpay webhook Error: get Transaction/Subscription in Galaxpay => ${err?.message}`);
          }

          if (galaxpayFristTransactionId === GalaxPayTransaction.galaxPayId) {
            // update frist payment
            const order = await findOrderById(originalOrderId);
            // Update value Subscription in GalaxPay

            //   logger.log('plan-> ', JSON.stringify(plan));
            // subscripton is paid
            if (checkStatusPaid(galaxPayTransactionStatus) && order.items) {
              const oldSubscriptionValue = docSubscription.data()?.value
                || ({ ...order.amount }.total * 100);

              const newValue = checkAmountItemsOrder(
                { ...order.amount },
                [...order.items],
                { ...plan },
              );
              if (newValue && newValue !== oldSubscriptionValue) {
                await updateValueSubscription(
                  app,
                  originalOrderId,
                  order.amount,
                  order.items,
                  plan,
                );

                collectionSubscription.doc(originalOrderId)
                  .set({
                    updatedAt: new Date().toISOString(),
                    value: newValue,
                  }, { merge: true })
                  .catch(logger.error);
              }
            }
            //   logger.log('ORDER: ', JSON.stringify(order.amount), ' **');
            // logger.log('> order ', order)

            if (order.financial_status
              && checkStatusIsEqual(order.financial_status, galaxPayTransactionStatus)) {
              // check status is equal
              return res.sendStatus(200);
            } if (order.transactions) {
              // update payment
              const transactionId = order.transactions[0]._id;
              let notificationCode = `;${GalaxPayTransaction.tid || ''};`;
              notificationCode += `${GalaxPayTransaction.authorizationCode || ''}`;
              const bodyPaymentHistory = {
                date_time: transactionCreatedAt || new Date().toISOString(),
                status: parseStatus(galaxPayTransactionStatus),
                transaction_id: transactionId,
                notification_code: `${type};${galaxpayHook.webhookId}${notificationCode}`,
                flags: ['GalaxPay'],
              } as any; // TODO: incompatible type=> amount and status;;

              await api.post(`orders/${order._id}/payments_history`, bodyPaymentHistory);

              await api.patch(
                `orders/${order._id}/transactions/${transactionId}`,
                {
                  intermediator: {
                    transaction_id: GalaxPayTransaction.tid || '',
                    transaction_code: GalaxPayTransaction.authorizationCode || '',
                  },
                },
              );

              return res.sendStatus(200);
            }
          } else {
            /*
                  add order, because recurrence creates all transactions in the
                  first transaction when quantity is non-zero,search for the order by ID,
                  if not found, create the transaction, and if found, check if it will be
                  necessary to update the transaction status
                */
            const transactionId = String(gerateId(GalaxPayTransaction.galaxPayId));

            const { result } = await findOrderByTransactionId(transactionId);

            if (!result || !result.length) {
              // logger.log('> Not found Transaction in API')
              if (checkStatusPaid(galaxPayTransactionStatus)
                && checkPayDay(GalaxPayTransaction.payday)) {
                // necessary to create order
                return createTransaction(
                  res,
                  subscriptionLabel,
                  plan,
                  orderNumber,
                  galaxpayFristTransactionId,
                  GalaxPayTransaction,
                  GalaxPaySubscription,
                  GalaxPayTransactionValue,
                  originalOrderId,
                );
              }
              // fetches the original order again to avoid delay from other webhooks
              let originalOrder: Orders | undefined;
              try {
                originalOrder = await findOrderById(originalOrderId);
              } catch {
                logger.warn(`Original Order not found (${originalOrderId}) `);
                res.status(404).send({ message: 'Original Order not found' });
              }
              logger.log(`>> Status Original Order: ${originalOrder?.status} `);

              if (originalOrder && galaxpaySubscriptionStatus === 'canceled'
                && originalOrder?.status !== 'cancelled') {
                // console.log('>> galaxpay webhook: Subscription canceled at galapay');
                try {
                  await api.patch(`orders/${originalOrderId}`, { status: 'cancelled' });
                  collectionSubscription.doc(originalOrderId)
                    .set({
                      status: 'cancelled',
                      updatedAt: new Date().toISOString(),
                    }, { merge: true })
                    .catch(logger.error);

                  return res.sendStatus(200);
                } catch (err) {
                  logger.error(err);
                  return res.sendStatus(400);
                }
              } else {
                logger.log(`>> galaxpay webhook: Status or checkPayDay invalid => Payday: ${GalaxPayTransaction.payday} now: ${new Date().toISOString()}`);
                return res.status(404).send('Status or checkPayDay invalid');
              }
            }
            const order = result[0];
            if (order.financial_status
              && checkStatusIsEqual(order.financial_status, galaxPayTransactionStatus)) {
              // check status is equal
              // logger.log('> Equals Status')
              return res.sendStatus(200);
            }
            // logger.log('> Order id ')
            // update payment
            let notificationCode = `;${GalaxPayTransaction.tid || ''};`;
            notificationCode += `${GalaxPayTransaction.authorizationCode || ''}`;
            const bodyPaymentHistory = {
              date_time: transactionCreatedAt || new Date().toISOString(),
              status: parseStatus(galaxPayTransactionStatus),
              transaction_id: transactionId,
              notification_code: `${type};${galaxpayHook.webhookId}${notificationCode}`,
              flags: ['GalaxPay'],
            } as any; // TODO: incompatible type=> amount and status;

            await api.post(`orders/${order._id}/payments_history`, bodyPaymentHistory);

            // logger.log('>  create Payment History')

            await api.patch(
              `orders/${order._id}/transactions/${transactionId}`,
              {
                intermediator: {
                  transaction_id: GalaxPayTransaction.tid || '',
                  transaction_code: GalaxPayTransaction.authorizationCode || '',
                },
              },
            );

            if (parseStatus(galaxPayTransactionStatus) === 'voided'
              || parseStatus(galaxPayTransactionStatus) === 'refunded') {
              await api.patch(`orders/${order._id}`, { status: 'cancelled' });

              // logger.log('> UPDATE ORDER OK')
              return res.sendStatus(200);
            }
            // logger.log('> UPDATE Transaction OK')
            return res.sendStatus(200);
          }
        }
      }
      //
      return res.status(404).send('Document not found in firestore');
    } if (type === 'subscription.addTransaction') {
      if (GalaxPaySubscriptionQuantity === 0) {
        // find transaction in firebase
        const documentSnapshot = await collectionSubscription.doc(originalOrderId).get();
        if (documentSnapshot && documentSnapshot.exists) {
          const docSubscription = documentSnapshot.data();

          if (docSubscription) {
            const {
              galaxpayFristTransactionId,
              plan,
              orderNumber,
              subscriptionLabel,
            } = docSubscription.data();

            if (checkPayDay(GalaxPayTransaction.payday)) {
              return createTransaction(
                res,
                subscriptionLabel,
                plan,
                orderNumber,
                galaxpayFristTransactionId,
                GalaxPayTransaction,
                GalaxPaySubscription,
                GalaxPayTransactionValue,
                originalOrderId,
              );
            }
          }
        }
        //
        return res.status(404).send('Document not found in firestore');
      }
      // Avoid retries of this GalaxPay webhook
      return res.status(200)
        .send(`Subscription webhook with non-zero quantity.
          The Order will be analyzed with the updateStatus webhook.`);
    }
    //
    return res.status(404).send('Unidentified webhook type');
  } catch (err: any) {
    // verificar catch
    logger.error(err);
    return res.sendStatus(500);
  }
};

export default handleWehook;
