// log on files
import logger from 'firebase-functions/logger';
// abstraction to setup PayPal SDK
import initClient from './init-client.mjs';

export default (env, clientId, clientSecret, paymentId, paypalPlus) => {
  // configured PayPal REST API client
  const paypal = initClient(env, clientId, clientSecret, paypalPlus);

  return new Promise((resolve, reject) => {
    // get payment with PayPal API v1
    // https://github.com/paypal/PayPal-node-SDK/blob/master/samples/payment/get.js
    paypal.payment.get(paymentId, (err, payment) => {
      if (err) {
        const { response } = err;
        if (response && response.httpStatusCode !== 404) {
          // debug PayPal API response
          err.origin = 'get-payment';
          logger.error(err);
        }
        reject(err);
      } else {
        resolve(payment);
      }
    });
  });
};
