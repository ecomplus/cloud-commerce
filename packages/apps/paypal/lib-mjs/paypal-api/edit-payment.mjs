import logger from 'firebase-functions/logger';
// abstraction to setup PayPal SDK
import initClient from './init-client.mjs';

export default (env, clientId, clientSecret, paymentId, editPaymentBody) => {
  // configured PayPal REST API client
  const paypal = initClient(env, clientId, clientSecret);

  return new Promise((resolve, reject) => {
    // edit payment with PayPal API v1
    // https://developer.paypal.com/docs/api/payments/v1/#payment_update
    let patchRequestBody;
    if (!Array.isArray(editPaymentBody)) {
      patchRequestBody = [];
      Object.keys(editPaymentBody).forEach((field) => {
        const value = editPaymentBody[field];
        if (value) {
          patchRequestBody.push({
            op: 'add',
            path: `/transactions/0/${field}`,
            value,
          });
        }
      });
    } else {
      patchRequestBody = editPaymentBody;
    }

    paypal.payment.update(paymentId, patchRequestBody, (err, payment) => {
      if (err) {
        const { response } = err;
        if (response) {
          const { httpStatusCode, details } = response;
          if (httpStatusCode === 400 && details) {
            // debug PayPal API response details
            response.details = JSON.stringify(details, null, 2);
            err.origin = 'edit-payment';
            logger.error(err);
          }
        }
        reject(err);
      } else {
        resolve(payment);
      }
    });
  });
};
