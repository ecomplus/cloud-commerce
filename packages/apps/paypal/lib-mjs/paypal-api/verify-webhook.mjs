// abstraction to setup PayPal SDK
import initClient from './init-client.mjs';

export default (env, clientId, clientSecret, eventBody) => {
  // configured PayPal REST API client
  const paypal = initClient(env, clientId, clientSecret);

  // verify received notification body
  // https://github.com/paypal/PayPal-node-SDK/blob/master/samples/notifications/webhook-events/get_and_verify.js
  return new Promise((resolve, reject) => {
    paypal.notification.webhookEvent.get(eventBody.id, (err, response) => {
      if (err) {
        // invalid webhook ?
        // logger.error(err)
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
};
