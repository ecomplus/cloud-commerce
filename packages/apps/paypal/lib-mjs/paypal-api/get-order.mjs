import logger from 'firebase-functions/logger';
// PayPal checkout SDK
// eslint-disable-next-line import/no-extraneous-dependencies
import { orders } from '@paypal/checkout-server-sdk';
// abstraction to setup PayPal Checkout SDK
import newCheckoutClient from './new-checkout-client.mjs';

export default async (env, clientId, clientSecret, orderId) => {
  // configured PayPal checkout client
  const paypalClient = newCheckoutClient(env, clientId, clientSecret);

  // call PayPal to get the transaction details
  // https://developer.paypal.com/docs/checkout/integrate/#2-server-side
  const request = new orders.OrdersGetRequest(orderId);
  try {
    const { result } = await paypalClient.execute(request);
    return result;
  } catch (err) {
    if (!err.statusCode || err.statusCode !== 404) {
      // debug PayPal API response
      err.origin = 'get-order';
      logger.error(err);
    }
    throw err;
  }
};
