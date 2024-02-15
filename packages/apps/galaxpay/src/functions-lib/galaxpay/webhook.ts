import type {
  Orders,
  Applications,
  ResourceId,
} from '@cloudcommerce/types';
import type { Request, Response } from 'firebase-functions';
import api from '@cloudcommerce/api';
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import { parseStatus, parsePeriodicityToEcom } from '../all-parses';
import {
  findOrderById,
  getOrderIntermediatorTId,
} from '../ecom/request-api';
import {
  createItemsAndAmount,
  updateDocSubscription,
} from '../firestore/utils';
import GalaxpayAxios from './auth/create-access';
import {
  checkAndUpdateSubscriptionGalaxpay,
  checkItemsAndRecalculeteOrder,
  compareDocItemsWithOrder,
  updateValueSubscriptionGalaxpay,
} from './update-subscription';

type FinancialStatusCurrent = Exclude<Orders['financial_status'], undefined>['current']

const collectionSubscription = getFirestore().collection('galaxpaySubscriptions');
const collectionTransactions = getFirestore().collection('galaxpayTransactions');

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

const createTransaction = async (
  res: Response,
  subscriptionLabel: string,
  docSubscription,
  orderNumber: string,
  galaxpayFristTransactionId: string,
  galaxPayTransaction,
  galaxPaySubscription,
  galaxPayTransactionValue: number,
  originalOrderId: ResourceId,
) => {
  if (galaxpayFristTransactionId !== galaxPayTransaction.galaxPayId) {
    // let body;
    const originalOrder = (await api.get(`orders/${originalOrderId}`)).data;

    // logger.log('> Create new Order ')
    if (originalOrder.transactions && originalOrder.items) {
      const { installment } = galaxPayTransaction;
      const {
        buyers,
        items,
        domain,
        amount,
      } = originalOrder;

      const { plan } = docSubscription;
      let { itemsAndAmount } = docSubscription;

      try {
        const transactionDoc = (await collectionTransactions
          .doc(`${galaxPayTransaction.galaxPayId}`).get())?.data();

        itemsAndAmount = transactionDoc?.itemsAndAmount;
        // logger.log('>> items to transaction');
      } catch (err) {
        logger.warn(err);
      }

      const channelType = originalOrder.channel_type;
      const shippingLines = originalOrder.shipping_lines;
      const shippingMethodLabel = originalOrder.shipping_method_label;
      const paymentMethodLabel = originalOrder.payment_method_label;
      const originalTransaction = originalOrder.transactions[0];
      const quantity = installment;
      const periodicity = parsePeriodicityToEcom(galaxPaySubscription.periodicity);
      const dateUpdate = galaxPayTransaction.datetimeLastSentToOperator
        ? new Date(galaxPayTransaction.datetimeLastSentToOperator).toISOString()
        : new Date().toISOString();

      if (itemsAndAmount && itemsAndAmount.items?.length) {
        compareDocItemsWithOrder(itemsAndAmount, items, amount, galaxPayTransactionValue);
      }
      // recalculate order
      const shippingLine = shippingLines && shippingLines[0];
      const { shippingLine: newShippingLine } = await checkItemsAndRecalculeteOrder(
        amount,
        items,
        plan,
        null,
        shippingLine,
      );

      if (shippingLines?.length && newShippingLine) {
        shippingLines[0] = newShippingLine;
      }

      if (amount.balance) {
        delete amount.balance;
      }

      items.forEach((item) => {
        if (item.stock_status && item.stock_status !== 'unmanaged') {
          item.stock_status = 'pending';
        }
      });

      const tId = galaxPayTransaction.tid;

      const transactions: Orders['transactions'] = [
        {
          amount: originalTransaction.amount,
          status: {
            updated_at: dateUpdate,
            current: parseStatus(galaxPayTransaction.status),
          },
          intermediator: {
            transaction_id: tId,
            transaction_code: galaxPayTransaction.authorizationCode || '',
            transaction_reference: galaxPayTransaction.tid || '',
          },
          payment_method: originalTransaction.payment_method,
          app: originalTransaction.app,
          notes: `Parcela #${quantity} referente à ${subscriptionLabel} ${periodicity}`,
          custom_fields: originalTransaction.custom_fields,
        },
      ];

      transactions[0].payment_link = galaxPaySubscription.paymentLink;

      const financialStatus = {
        updated_at: dateUpdate,
        current: parseStatus(galaxPayTransaction.status) as FinancialStatusCurrent,
      };

      const planPergentage = plan?.discount
        ? plan.discount.type === 'percentage' || plan.discount.percentage
        : null;

      let notes = `Parcela #${quantity} desconto de ${planPergentage ? '' : 'R$'}`;
      if (planPergentage) {
        notes += ` ${plan?.discount?.value || ''} ${planPergentage ? '%' : ''}`;
        notes += ` sobre ${plan?.discount?.apply_at || ''}`;
        notes += ` referente à ${subscriptionLabel} ${periodicity}`;
      }

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
        notes,
        staff_notes: `Valor cobrado no GalaxPay R$${galaxPayTransactionValue}`,
      };

      const finalAmount = Math.floor(parseFloat((amount.total).toFixed(2)) * 1000) / 1000;

      if (galaxPayTransactionValue !== finalAmount) {
        logger.warn(`#${galaxPayTransaction.galaxPayId}] amount: ${
          JSON.stringify(amount)
        }, Galaxpay value: ${galaxPayTransactionValue}, items: ${JSON.stringify(items)},`);
      }

      const { result } = await getOrderIntermediatorTId(tId);

      if (!result.length) {
        await api.post('orders', body);
        // logger.log('> Created new order API')
        await collectionTransactions.doc(`${galaxPayTransaction.galaxPayId}`)
          .delete()
          .catch(logger.error);

        return res.sendStatus(201);
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

  const whGalaxPay = req.body;
  const type = whGalaxPay.event;
  const whGalaxPaySubscription = whGalaxPay.Subscription;
  const whGalaxPaySubscriptionQuantity = whGalaxPaySubscription.quantity;
  const originalOrderId = whGalaxPaySubscription.myId;
  const whGalaxPayTransaction = whGalaxPay.Transaction;
  const whGalaxPayTransactionValue = whGalaxPayTransaction.value / 100;

  logger.log(
    `> (App GalaxPay) WebHook ${type}, Body ${JSON.stringify(whGalaxPay)}, quantity:
    ${whGalaxPaySubscriptionQuantity}, status: ${whGalaxPayTransaction.status} <`,
  );

  try {
    const app = await getApp();

    if (!process.env.GALAXPAY_ID) {
      const galaxpayId = app.hidden_data?.galaxpay_id;
      if (galaxpayId && typeof galaxpayId === 'string') {
        process.env.GALAXPAY_ID = galaxpayId;
      } else {
        logger.warn('Missing GalaxPay ID');
      }
    }

    if (!process.env.GALAXPAY_HASH) {
      const galaxpayHash = app.hidden_data?.galaxpay_hash;
      if (galaxpayHash && typeof galaxpayHash === 'string') {
        process.env.GALAXPAY_HASH = galaxpayHash;
      } else {
        logger.warn('Missing GalaxPay Hash');
      }
    }

    const galaxpayAxios = new GalaxpayAxios({
      galaxpayId: process.env.GALAXPAY_ID,
      galaxpayHash: process.env.GALAXPAY_HASH,
    });

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
          } = docSubscription;

          let galaxPayTransactionStatus: string | undefined;
          let galaxpaySubscriptionStatus: string | undefined;
          let transactionCreatedAt: string | undefined;

          try {
            // check subscription and transaction status before in galaxpay
            await galaxpayAxios.preparing;

            if (galaxpayAxios.axios) {
              let { data } = await galaxpayAxios.axios
                .get(`/transactions?galaxPayIds=${whGalaxPayTransaction.galaxPayId}&startAt=0&limit=1`);

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

          if (galaxpayFristTransactionId === whGalaxPayTransaction.galaxPayId) {
            // update frist payment
            const order = await findOrderById(originalOrderId);
            // Update value Subscription in GalaxPay

            // subscripton is paid
            if (checkStatusPaid(galaxPayTransactionStatus) && order.items) {
              const oldSubscriptionValue = docSubscription.data()?.value
                || ({ ...order.amount }.total * 100);

              let shippingLine: Exclude<Orders['shipping_lines'], undefined>[number] | undefined;

              if (order.shipping_lines?.length) {
                [shippingLine] = order.shipping_lines;
              }

              const { value: newValue } = await checkItemsAndRecalculeteOrder(
                order.amount,
                order.items,
                plan,
                null,
                shippingLine,
              );
              if (newValue && (newValue / 100) !== oldSubscriptionValue) {
                await checkAndUpdateSubscriptionGalaxpay(
                  originalOrderId,
                  order.amount,
                  order.items,
                  plan,
                  oldSubscriptionValue,
                  shippingLine,
                );

                await collectionSubscription.doc(originalOrderId)
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
            }

            if (order.transactions?.length) {
              // update payment
              const transactionId = order.transactions[0]._id;
              let notificationCode = `;${whGalaxPayTransaction.tid || ''};`;
              notificationCode += `${whGalaxPayTransaction.authorizationCode || ''}`;
              const bodyPaymentHistory = {
                date_time: transactionCreatedAt || new Date().toISOString(),
                status: parseStatus(galaxPayTransactionStatus),
                transaction_id: transactionId,
                notification_code: `${type};${whGalaxPay.webhookId}${notificationCode}`,
                flags: ['GalaxPay'],
              } as any; // TODO: incompatible type=> amount and status;;

              await api.post(`orders/${order._id}/payments_history`, bodyPaymentHistory);

              await api.patch(
                `orders/${order._id}/transactions/${transactionId}`,
                {
                  intermediator: {
                    transaction_id: whGalaxPayTransaction.galaxPayId,
                    transaction_reference: whGalaxPayTransaction.tid || '',
                    transaction_code: whGalaxPayTransaction.authorizationCode || '',
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
            const tId = whGalaxPayTransaction.galaxPayId;

            const { result } = await getOrderIntermediatorTId(tId);

            if (!result || !result.length) {
              // logger.log('> Not found Transaction in API')
              if (checkStatusPaid(galaxPayTransactionStatus)
                && checkPayDay(whGalaxPayTransaction.payday)) {
                // necessary to create order
                return createTransaction(
                  res,
                  subscriptionLabel,
                  docSubscription,
                  orderNumber,
                  galaxpayFristTransactionId,
                  whGalaxPayTransaction,
                  whGalaxPaySubscription,
                  whGalaxPayTransactionValue,
                  originalOrderId,
                );
              }
              // fetches the original order again to avoid delay from other webhooks
              let originalOrder: Orders | undefined;
              try {
                originalOrder = await findOrderById(originalOrderId);
              } catch (err) {
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
                logger.log(`>> galaxpay webhook: Status or checkPayDay invalid => Payday: ${whGalaxPayTransaction.payday} now: ${new Date().toISOString()}`);
                return res.status(404).send('Status or checkPayDay invalid');
              }
            }
            const orderId = result[0]._id;
            const { data: order } = await api.get(`orders/${orderId}`);
            const transaction = order.transactions?.find(
              (transactionFind) => transactionFind.intermediator?.transaction_id === tId,
            );

            if (order.financial_status
              && checkStatusIsEqual(order.financial_status, galaxPayTransactionStatus)) {
              // check status is equal
              // logger.log('> Equals Status')
              return res.sendStatus(200);
            }
            // update payment
            let notificationCode = `;${whGalaxPayTransaction.tid || ''};`;
            notificationCode += `${whGalaxPayTransaction.authorizationCode || ''}`;

            const bodyPaymentHistory = {
              date_time: transactionCreatedAt || new Date().toISOString(),
              status: parseStatus(galaxPayTransactionStatus),
              // transaction_id: transactionId,
              notification_code: `${type};${whGalaxPay.webhookId}${notificationCode}`,
              flags: ['GalaxPay'],
            } as any; // TODO: incompatible type=> amount and status;

            await api.post(`orders/${order._id}/payments_history`, bodyPaymentHistory);

            // logger.log('>  create Payment History')

            await api.patch(
              `orders/${order._id}/transactions/${transaction?._id}`,
              {
                intermediator: {
                  transaction_id: whGalaxPayTransaction.tid || '',
                  transaction_code: whGalaxPayTransaction.authorizationCode || '',
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
      if (whGalaxPaySubscription?.quantity === 0) {
      // console.log('>> Add transaction')
        const documentSnapshot = await collectionSubscription.doc(originalOrderId).get();
        if (documentSnapshot && documentSnapshot.exists) {
          const subscriptionDoc = documentSnapshot.data();
          if (subscriptionDoc) {
            const { plan, transactionId } = subscriptionDoc;
            if (transactionId !== whGalaxPayTransaction.galaxPayId) {
              const order = await findOrderById(originalOrderId);

              let { itemsAndAmount } = subscriptionDoc;
              if (itemsAndAmount && itemsAndAmount.items?.length) {
                compareDocItemsWithOrder(
                  itemsAndAmount,
                  order.items,
                  order.amount,
                  whGalaxPayTransactionValue,
                );
              }

              let shippingLine: Exclude<Orders['shipping_lines'], undefined>[number] | undefined;

              if (order?.shipping_lines?.length) {
                [shippingLine] = order.shipping_lines;
              }

              if (order.items) {
                await checkItemsAndRecalculeteOrder(
                  order.amount,
                  order.items,
                  plan,
                  null,
                  shippingLine,
                );
              }

              itemsAndAmount = createItemsAndAmount(order.amount, order.items);

              await collectionTransactions.doc(`${whGalaxPayTransaction.galaxPayId}`)
                .set(
                  {
                    itemsAndAmount,
                    updatedAt: new Date().toISOString(),
                  },
                  { merge: true },
                );

              try {
                await galaxpayAxios.preparing;

                if (galaxpayAxios.axios) {
                  const { data } = await galaxpayAxios.axios
                    .get(`/transactions?galaxPayIds=${whGalaxPayTransaction.galaxPayId}&startAt=0&limit=1`);

                  const value = itemsAndAmount?.amount?.total
                    && Math.floor(parseFloat((itemsAndAmount.amount.total).toFixed(2)) * 100);
                  const hasUpdateValue = value && data?.Transactions[0]?.value
                    && value !== data?.Transactions[0]?.value;

                  if (hasUpdateValue) {
                    const resp = await updateValueSubscriptionGalaxpay(
                      galaxpayAxios,
                      originalOrderId,
                      value,
                    );

                    if (resp) {
                      logger.log('> Successful signature edit on Galax Pay');
                      const body = { itemsAndAmount };
                      if (value) {
                        Object.assign(body, { value });
                      }

                      await updateDocSubscription(collectionSubscription, body, originalOrderId);
                    }
                  }
                }
              } catch (error) {
                logger.error(error);
              }

              return res.sendStatus(200);
            }
            // console.log('>> Transaction Original')
            return res.sendStatus(200);
          }
        }

        return res.sendStatus(400);
      }
      // Avoid retries of this GalaxPay webhook
      return res.status(200)
        .send('Subscription webhook with non-zero quantity. The Order will be analyzed with the updateStatus webhook.');
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
