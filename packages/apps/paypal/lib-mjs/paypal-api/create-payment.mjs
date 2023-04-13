// log on files
import logger from 'firebase-functions/logger';
// abstraction to setup PayPal SDK
import initClient from './init-client.mjs';

export default (env, clientId, clientSecret, createPaymentBody, paypalPlus) => {
  // configured PayPal REST API client
  const paypal = initClient(env, clientId, clientSecret, paypalPlus);

  return new Promise((resolve, reject) => {
    // create payment with PayPal API v1
    // https://github.com/paypal/PayPal-node-SDK/blob/master/samples/payment/create_with_paypal.js
    paypal.payment.create(createPaymentBody, (err, payment) => {
      if (err) {
        const { response } = err;
        if (response) {
          const { httpStatusCode, details } = response;
          // don't log unauthorized client errors
          if (httpStatusCode !== 401) {
            if (httpStatusCode === 400) {
              // debug PayPal API response details
              if (details) {
                response.details = JSON.stringify(details, null, 2);
                err.data = JSON.stringify(createPaymentBody, null, 2);
              }
            }
            err.origin = 'create-payment';
            logger.error(err);
          }
        } else {
          logger.error(err);
        }
        reject(err);
      } else {
        resolve(payment);
      }
    });
  });
};
