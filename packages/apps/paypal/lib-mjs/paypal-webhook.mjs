import logger from 'firebase-functions/logger';
// import api from '@cloudcommerce/api';
// get store and order ID from local database based on PayPal transaction code
// const { get } = require(process.cwd() + '/lib/database');
import { get } from './database.mjs';
// read configured E-Com Plus app data
// const getConfig = require(process.cwd() + '/lib/store-api/get-config');
// update order transaction status on Store API
// const updatePaymentStatus = require(process.cwd() + '/lib/store-api/update-payment-status');
// list orders from E-Com Plus Store API searching by transaction code
// const listOrdersByTransaction = require(process.cwd() + '/lib/store-api/list-orders-by-transaction');
// validate and read PayPal webhook event
// const verifyWebhook = require(process.cwd() + '/lib/paypal-api/verify-webhook');
import verifyWebhook from './paypal-api/verify-webhook.mjs';
// get intermediator object from payment gateway object
import newPayment from './new-payment-gateway.mjs';

const intermediatorCode = newPayment().intermediator.code;

const CLIENT_ERR = 'invalidClient';

export default (req, res) => {
  const { body } = req;
  // handle PayPal webhook body
  // https://developer.paypal.com/docs/integration/direct/webhooks/notification-messages/
  const transactionCode = body && body.resource
    && (body.resource.sale_id || body.resource.id);
  // logger.log(`PayPal webhook ${body.id}: ${transactionCode}`)
  if (!transactionCode) {
    return res.sendStatus(400);
  }

  // declare reusable Store API authentication object and Store ID
  let sdkClient; let
    storeId;

  // get Store ID first
  get(transactionCode)

    .then((data) => {
      storeId = data.storeId;
      // logger.log(storeId)
      // pre-authenticate to reuse auth object
      return appSdk.getAuth(storeId);
    })

    .then((auth) => {
      sdkClient = { appSdk, storeId, auth };
      // get app configured options
      // including hidden (authenticated) data
      return getConfig(sdkClient, true);
    })

    .then((config) => {
      // PayPal app credentials
      const paypalClientId = config.paypal_client_id;
      const paypalSecret = config.paypal_secret;
      const paypalEnv = config.paypal_sandbox && 'sandbox';
      if (paypalClientId && paypalSecret) {
        // read and verify PayPal webhook event
        return verifyWebhook(paypalEnv, paypalClientId, paypalSecret, body);
      }
      const err = new Error('No configured PayPal app credentials');
      err.name = CLIENT_ERR;
      throw err;
    })

    .then((paypalEvent) => {
      // we have full PayPal event object here
      // parse PayPal event type to E-Com Plus financial status
      let status;
      const paypalEventType = paypalEvent.event_type;
      logger.log(`PayPal event type ${paypalEventType} for ${transactionCode}`);

      switch (paypalEventType) {
        case 'PAYMENT.AUTHORIZATION.CREATED':
        case 'PAYMENT.PAYOUTSBATCH.PROCESSING':
          status = 'under_analysis';
          break;
        case 'PAYMENT.AUTHORIZATION.VOIDED':
          status = 'unauthorized';
          break;
        case 'PAYMENT.CAPTURE.COMPLETED':
        case 'PAYMENT.SALE.COMPLETED':
        case 'PAYMENT.PAYOUTSBATCH.SUCCESS':
          status = 'paid';
          break;
        case 'PAYMENT.CAPTURE.DENIED':
        case 'PAYMENT.SALE.DENIED':
        case 'PAYMENT.PAYOUTSBATCH.DENIED':
          status = 'voided';
          break;
        case 'PAYMENT.CAPTURE.PENDING':
        case 'PAYMENT.SALE.PENDING':
          status = 'pending';
          break;
        case 'PAYMENT.CAPTURE.REFUNDED':
        case 'PAYMENT.CAPTURE.REVERSED':
        case 'PAYMENT.SALE.REFUNDED':
        case 'PAYMENT.SALE.REVERSED':
        case 'RISK.DISPUTE.CREATED':
          status = 'refunded';
          break;
        default:
          // ignore unknow status
          return true;
      }

      // list order IDs for respective transaction code
      return listOrdersByTransaction(sdkClient, transactionCode)
        .then((orders) => {
          // change transaction status on E-Com Plus API
          const notificationCode = body.id;
          const flags = paypalEventType.split('.');
          const promises = [];
          orders.forEach((order) => {
            let transactionId;
            const { transactions } = order;
            if (Array.isArray(transactions)) {
              for (let i = 0; i < transactions.length; i++) {
                const transaction = transactions[i];
                const { app, intermediator } = transaction;
                if (intermediator && intermediator.transaction_code === String(transactionCode)) {
                  if (app && app.intermediator && app.intermediator.code !== intermediatorCode) {
                    return;
                  }
                  transactionId = transaction._id;
                  break;
                }
              }
            }
            if (transactionId) {
              promises.push(updatePaymentStatus(sdkClient, order._id, status, notificationCode, flags, transactionId));
            }
          });
          return Promise.all(promises);
        });
    })

    .then(() => {
      // Store API was changed with current transaction status
      // all done
      res.status(204);
      res.end();
    })

    .catch((err) => {
      const { name, message } = err;
      if (name === CLIENT_ERR || name === 'TransactionCodeNotFound') {
        logger.log(`Skip webhook ${body.id}`);
        // return response with client error code
        res.status(400);
        res.send({ name, message });
      } else {
        if (!err.request) {
          // not Axios error ?
          logger.error(err);
        }
        // return response with error
        res.status(500);
        res.send({
          error: 'paypal_webhook_error',
          message,
        });
      }
    });
};
