import paypal from './paypal-rest-sdk';
import _newConfig from './_new-config.mjs';

export default (env, clientId, clientSecret, paypalPlus = false) => {
  // setup and configure PayPal REST API client
  paypal.configure(_newConfig(env, clientId, clientSecret, paypalPlus));
  return paypal;
};
