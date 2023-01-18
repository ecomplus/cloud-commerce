import type {
  Orders,
  Applications,
  ResourceListResult,
} from '@cloudcommerce/types';
import type { Request, Response } from 'firebase-functions';
import api from '@cloudcommerce/api';
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import { parseStatus, parsePeriodicityToEcom, gerateId } from '../all-parses';
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

const checkStatus = (
  financialStatus: Exclude<Orders['financial_status'], undefined>,
  GalaxPayTransaction: { [x: string]: any },
) => {
  if (financialStatus.current === parseStatus(GalaxPayTransaction.status)) {
    return true;
  } if ((financialStatus.current === 'paid' || financialStatus.current === 'authorized')
    && parseStatus(GalaxPayTransaction.status) !== 'refunded') {
    return true;
  }
  return false;
};

const checkStatusNotValid = (status: string) => {
  const parsedStatus = parseStatus(status);
  // logger.log('>> Status (', status, ')=> ', parsedStatus);
  if (parsedStatus === 'unauthorized' || parsedStatus === 'refunded' || parsedStatus === 'voided') {
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

const findOrderById = async (orderId: string): Promise<Orders> => new Promise((resolve) => {
  api.get(
    `orders/${orderId}?fields=transactions,financial_status`,
  ).then(({ data: order }) => {
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
  originalOrderId: string,
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
          _id: transactionId,
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

  // if (galaxpayHook.confirmHash) {
  //   logger.log('> ', galaxpayHook.confirmHash);
  // }
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

          if (galaxpayFristTransactionId === GalaxPayTransaction.galaxPayId) {
            // update frist payment
            const order = await findOrderById(originalOrderId);
            // Update value Subscription in GalaxPay

            //   logger.log('plan-> ', JSON.stringify(plan));
            // not update subscripton canceled
            if (!checkStatusNotValid(GalaxPayTransaction.status) && order.items) {
              const app = await getApp();
              await updateValueSubscription(app, originalOrderId, order.amount, order.items, plan);
            }
            //   logger.log('ORDER: ', JSON.stringify(order.amount), ' **');
            // logger.log('> order ', order)

            if (order.financial_status
              && checkStatus(order.financial_status, GalaxPayTransaction)) {
              return res.sendStatus(200);
            } if (order.transactions) {
              // update payment
              const transactionId = order.transactions[0]._id;
              const bodyPaymentHistory = {
                date_time: new Date().toISOString(),
                status: parseStatus(GalaxPayTransaction.status),
                transaction_id: transactionId,
                notification_code: `${type};${galaxpayHook.webhookId}`,
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
              if (!checkStatusNotValid(GalaxPayTransaction.status)
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
              // TODO: status 400 or 500?
              return res.status(404).send('Status or checkPayDay invalid');
            }
            const order = result[0];
            if (order.financial_status
              && checkStatus(order.financial_status, GalaxPayTransaction)) {
              // logger.log('> Equals Status')
              return res.sendStatus(200);
            }
            // logger.log('> Order id ')
            // update payment
            const bodyPaymentHistory = {
              date_time: new Date().toISOString(),
              status: parseStatus(GalaxPayTransaction.status),
              transaction_id: transactionId,
              notification_code: `${type};${galaxpayHook.webhookId}`,
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

            if (parseStatus(GalaxPayTransaction.status) === 'voided'
              || parseStatus(GalaxPayTransaction.status) === 'refunded') {
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
