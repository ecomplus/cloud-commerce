// APP hostname and base URL path
// log on files
import logger from 'firebase-functions/logger';
// abstraction to setup PayPal SDK
import initClient from './init-client.mjs';

const appBaseUri = process.env.APP_BASE_URI;

// preset webhook body with Paypal event names
// https://developer.paypal.com/docs/integration/direct/webhooks/event-names/#authorized-and-captured-payments
const webhookBody = {
  url: `${appBaseUri}/paypal/webhook`,
  event_types: [
    // v2
    'PAYMENT.AUTHORIZATION.CREATED',
    'PAYMENT.AUTHORIZATION.VOIDED',
    'PAYMENT.CAPTURE.COMPLETED',
    'PAYMENT.CAPTURE.DENIED',
    'PAYMENT.CAPTURE.PENDING',
    'PAYMENT.CAPTURE.REFUNDED',
    'PAYMENT.CAPTURE.REVERSED',
    // v1
    'PAYMENT.SALE.PENDING',
    'PAYMENT.SALE.DENIED',
    'PAYMENT.SALE.COMPLETED',
    'PAYMENT.SALE.REFUNDED',
    'PAYMENT.SALE.REVERSED',
    'PAYMENT.PAYOUTSBATCH.PROCESSING',
    'PAYMENT.PAYOUTSBATCH.SUCCESS',
    'PAYMENT.PAYOUTSBATCH.DENIED',
    'RISK.DISPUTE.CREATED',
  ].map((name) => ({ name })),
};

export default (env, clientId, clientSecret) => {
  // configured PayPal REST API client
  const paypal = initClient(env, clientId, clientSecret);

  return new Promise((resolve, reject) => {
    // try to register new webhook
    // https://github.com/paypal/PayPal-node-SDK/blob/master/samples/notifications/webhooks/create.js
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    paypal.notification.webhook.create(webhookBody, (err, webhook) => {
      if (err && (!err.response || err.response.name !== 'WEBHOOK_URL_ALREADY_EXISTS')) {
        err.origin = 'create-webhook';
        if (err.httpStatusCode !== 401) {
          logger.error(err);
        }
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
