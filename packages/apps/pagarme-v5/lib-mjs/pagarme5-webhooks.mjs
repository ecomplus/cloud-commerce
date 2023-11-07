import { getFirestore } from 'firebase-admin/firestore';
import config from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';
import logger from 'firebase-functions/logger';
import axios from './functions-lib/pagarme/create-axios.mjs';
import {
  getOrderById,
  addPaymentHistory,
  updateTransaction,
  getOrderIntermediatorTransactionId,
  createNewOrderBasedOld,
  // updateOrder,
  checkItemCategory,
} from './functions-lib/api-utils.mjs';
import { parserChangeStatusToEcom } from './functions-lib/pagarme/parses-utils.mjs';

const getAppData = async () => {
  return new Promise((resolve, reject) => {
    api.get(
      `applications?app_id=${config.get().apps.pagarMeV5.appId}&fields=hidden_data`,
    )
      .then(({ data: result }) => {
        resolve(result[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const handleWehook = async (req, res) => {
  const colletionFirebase = getFirestore().collection('pagarmeV5Subscriptions');
  const { body } = req;

  try {
    const type = body.type;
    const appData = await getAppData();

    if (!process.env.PAGARMEV5_API_TOKEN) {
      const pagarmeApiToken = appData.pagarme_api_token;
      if (pagarmeApiToken && typeof pagarmeApiToken === 'string') {
        process.env.PAGARMEV5_API_TOKEN = pagarmeApiToken;
      } else {
        logger.warn('Missing PAGARMEV5 API TOKEN');

        return res.status(401)
          .send({
            error: 'NO_PAGARME_KEYS',
            message: 'The token is not defined in the application\'s environment variables and hidden data',
          });
      }
    }
    const pagarmeAxios = axios(process.env.PAGARMEV5_API_TOKEN);
    logger.log(`>> webhook ${JSON.stringify(body)}, type:${type}`);
    if (type === 'subscription.created' && body.data) {
      const orderOriginalId = body.data?.code;
      const subscriptionPagarmeId = body.data?.id;
      logger.log(`>> Check SubcriptionId: ${orderOriginalId}`);
      const documentSnapshot = await colletionFirebase.doc(orderOriginalId).get();
      const docSubscription = documentSnapshot.exists && documentSnapshot.data();
      if (!docSubscription) {
        logger.log('> Subscription not found');
        return res.status(404)
          .send({ message: `Subscription code: #${orderOriginalId} not found` });
      }
      const requestPagarme = [];
      // Check if the product belongs to categories that can be subscribed
      const categoryIds = appData.recurrency_category_ids;
      const { items: itemsApi } = await getOrderById(orderOriginalId);

      if (categoryIds && Array.isArray(categoryIds) && categoryIds.length) {
        const { data: { items: itemsPagarme } } = await pagarmeAxios.get(`/subscriptions/${subscriptionPagarmeId}`);
        const itemsIdPagarmeDelete = await checkItemCategory(categoryIds, itemsPagarme, itemsApi);

        const urlRemoveItem = `/subscriptions/${subscriptionPagarmeId}/items/`;
        if (itemsIdPagarmeDelete?.length) {
          itemsIdPagarmeDelete.forEach((itemId) => {
            requestPagarme.push(pagarmeAxios.delete(`${urlRemoveItem}${itemId}`));
          });
        }
      }

      const { plan } = docSubscription;
      const { discount } = plan;
      const urlDiscount = `/subscriptions/${subscriptionPagarmeId}/discounts`;
      const bodyDiscountPagarme = { value: discount.value };

      // Add plan discount on each product
      if (discount.type === 'percentage') {
        itemsApi?.forEach((item) => {
          requestPagarme.push(pagarmeAxios.post(
            urlDiscount,
            {
              ...bodyDiscountPagarme,
              discount_type: 'percentage',
              item_id: `pi_${item.sku}`,
            },
          ));
        });

        // Apply shipping discount if app configuration allows
        if (discount.apply_at !== 'subtotal') {
          requestPagarme.push(pagarmeAxios.post(
            urlDiscount,
            {
              ...bodyDiscountPagarme,
              discount_type: 'percentage',
              item_id: `pi_freight_${orderOriginalId}`,
            },
          ));
        }
      } else {
        requestPagarme.push(pagarmeAxios.post(
          urlDiscount,
          {
            ...bodyDiscountPagarme,
            discount_type: 'flat',
          },
        ));
      }

      try {
        await Promise.all(requestPagarme);
        logger.log('>> Updated signature');
        res.status(201)
          .send({ message: 'Updated signature' });
      } catch (error) {
        logger.error(error);
        const errCode = 'WEBHOOK_PAGARME_INVOICE_CREATED';
        let status = 409;
        let message = error.message;
        if (error.response) {
          status = error.response.status || status;
          const { data } = error.response;
          if (status !== 401 && status !== 403) {
            message = error.response.message || message;
          } else if (
            data && Array.isArray(data.errors)
            && data.errors[0] && data.errors[0].message
          ) {
            message = data.errors[0].message;
          }
        }
        return res.status(status || 400)
          .send({
            error: errCode,
            message,
          });
      }
    } else if (type === 'subscription.canceled' && body.data) {
      const { data: subscription } = await pagarmeAxios.get(`/subscriptions/${body.data.id}`);
      if (subscription && subscription.status === 'canceled') {
        const orderOriginalId = subscription.code;
        const orderOriginal = await getOrderById(orderOriginalId);
        if (!orderOriginal) {
          logger.log('>> Order status canceled');
          return res.sendStatus(404);
        } if (orderOriginal.status !== 'cancelled') {
          await api.patch(`orders/${orderOriginalId}`, { status: 'cancelled' });
          logger.log('>> Status update Cancelled');
          return res.sendStatus(200);
        }
        logger.log('>> Order status canceled');
        return res.sendStatus(200);
      }
      return res.status(!subscription ? 404 : 400)
        .send({ message: !subscription ? 'Not found subscription' : 'Subscription not canceled' });
    } else if (type.startsWith('charge.')) {
      // const statusChange = type.replace('charge.', '')
      const { data: charge } = await pagarmeAxios.get(`/charges/${body.data.id}`);
      logger.log('>> Charge ', JSON.stringify(charge));
      if (charge.invoice) {
        const { invoice, status } = charge;
        logger.log('>>Parse status: ', parserChangeStatusToEcom(status));
        const order = await getOrderIntermediatorTransactionId(invoice.id);
        if (order) {
          if (order.financial_status.current !== parserChangeStatusToEcom(status)) {
            // updadte status
            const transaction = order.transactions
              .find(
                (transactionFind) => transactionFind.intermediator.transaction_id === invoice.id,
              );
            logger.log('>> Try add payment history');
            const transactionPagarme = charge.last_transaction;
            let notificationCode = `${type};${body.id};`;
            if (transactionPagarme.transaction_type === 'credit_card') {
              notificationCode += `${transactionPagarme.gateway_id || ''};`;
              notificationCode += `${transactionPagarme.acquirer_tid || ''};`;
              notificationCode += `${transactionPagarme.acquirer_nsu || ''};`;
              notificationCode += `${transactionPagarme.acquirer_auth_code || ''};`;
            } else if (transactionPagarme.transaction_type === 'boleto') {
              notificationCode += `${transactionPagarme.gateway_id || ''};`;
            }
            const bodyPaymentHistory = {
              date_time: transactionPagarme.updated_at || new Date().toISOString(),
              status: parserChangeStatusToEcom(status),
              notification_code: notificationCode,
              flags: ['PagarMe'],
            };
            if (transaction && transaction._id) {
              bodyPaymentHistory.transaction_id = transaction._id;
            }
            await addPaymentHistory(order._id, bodyPaymentHistory);
            logger.log('>> Status update to paid');
            return res.sendStatus(200);
          }
          logger.log(`Status is ${parserChangeStatusToEcom(status)}`);
          return res.sendStatus(200);
        }

        if (status === 'paid') {
          logger.log('>> Try create new order for recurrence');
          const { data: subscription } = await pagarmeAxios.get(`/subscriptions/${invoice.subscriptionId}`);
          const orderOriginal = await getOrderById(subscription.code);
          const documentSnapshot = await colletionFirebase.doc(subscription.code).get();
          const docSubscription = documentSnapshot.exists && documentSnapshot.data();
          if (orderOriginal && docSubscription) {
            const { plan } = docSubscription;

            await createNewOrderBasedOld(orderOriginal, plan, 'paid', charge, subscription);

            // Check if the product belongs to categories that can be subscribed,
            // for next recurrence
            const categoryIds = appData.recurrency_category_ids;
            if (categoryIds && Array.isArray(categoryIds) && categoryIds.length) {
              const requestPagarme = [];
              const itemsPagarme = subscription.items;
              const itemsApi = orderOriginal.items;
              const itemsIdPagarmeDelete = await checkItemCategory(
                categoryIds,
                itemsPagarme,
                itemsApi,
              );

              const urlRemoveItem = `/subscriptions/${invoice.subscriptionId}/items/`;
              if (itemsIdPagarmeDelete?.length) {
                itemsIdPagarmeDelete.forEach((itemId) => {
                  requestPagarme.push(pagarmeAxios.delete(`${urlRemoveItem}${itemId}`));
                });
              }

              try {
                logger.log('>> Updated signature, for next recurrence');
                await Promise.all(requestPagarme);
              } catch (err) {
                logger.warn(err);
              }
            }

            logger.log('>> Create new Order');
            return res.sendStatus(201);
          }
          logger.log('>> Subscription not found');
          return res.status(404)
            .send({ message: `Subscription code: #${subscription.code} not found` });
        }

        logger.log('>> Order not found and transaction status is not paid');
        return res.status(400)
          .send({ message: 'Order not found and status is not paid' });
      }

      if (charge.order) {
        // TODO:
        // payment update (order in pagarme)
        logger.log('>> Try update status order');
        const { order: orderPagarme, status } = charge;
        const order = await getOrderIntermediatorTransactionId(orderPagarme.id);
        if (order) {
          if (order.financial_status.current !== parserChangeStatusToEcom(status)) {
            // updadte status
            let isUpdateTransaction = false;
            let transactionBody;
            const transaction = order.transactions.find(
              (transactionFind) => transactionFind.intermediator.transaction_id === orderPagarme.id,
            );
            // console.log('>> Try add payment history')
            const transactionPagarme = charge.last_transaction;
            // console.log('>>> TransactionPagarme ', JSON.stringify(transactionPagarme))
            let notificationCode = `${type};${body.id};`;
            if (transactionPagarme.transaction_type === 'credit_card') {
              notificationCode += `${transactionPagarme.gateway_id || ''};`;
              notificationCode += `${transactionPagarme.acquirer_tid || ''};`;
              notificationCode += `${transactionPagarme.acquirer_nsu || ''};`;
              notificationCode += `${transactionPagarme.acquirer_auth_code || ''};`;
            } else if (transactionPagarme.transaction_type === 'boleto') {
              notificationCode += `${transactionPagarme.gateway_id || ''};`;
            } else if (transactionPagarme.transaction_type === 'pix') {
              let notes = transaction.notes;
              // pix_provider_tid"
              notes = notes.replaceAll('display:block', 'display:none'); // disable QR Code
              notes = `${notes} # PIX Aprovado`;
              transactionBody = { notes };
              isUpdateTransaction = true;
            }
            const bodyPaymentHistory = {
              date_time: transactionPagarme.updated_at || new Date().toISOString(),
              status: parserChangeStatusToEcom(status),
              notification_code: notificationCode,
              flags: ['PagarMe'],
            };
            if (transaction && transaction._id) {
              bodyPaymentHistory.transaction_id = transaction._id;
            }
            await addPaymentHistory(order._id, bodyPaymentHistory);
            if (isUpdateTransaction && transaction._id) {
              // console.log('>> Try Update transaction ')
              await updateTransaction(order._id, transactionBody, transaction._id)
                .catch(logger.error);
            }
            logger.log(`>> Status update to ${parserChangeStatusToEcom(status)}`);
            return res.sendStatus(200);
          }
        }
        return res.sendStatus(404);
      }

      return res.sendStatus(405);
    }
    return res.sendStatus(405);
  } catch (error) {
    logger.error(error);
    const errCode = 'WEBHOOK_PAGARME_INTERNAL_ERR';
    let status = 409;
    let message = error.message;
    if (error.response) {
      status = error.response.status || status;
      const { data } = error.response;
      if (status !== 401 && status !== 403) {
        message = error.response.message || message;
      } else if (data && Array.isArray(data.errors) && data.errors[0] && data.errors[0].message) {
        message = data.errors[0].message;
      }
    }
    return res.status(status || 500)
      .send({
        error: errCode,
        message,
      });
  }
};

export default handleWehook;
