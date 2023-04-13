// setup and configure PayPal Checkout client
// https://github.com/paypal/Checkout-NodeJS-SDK
// eslint-disable-next-line import/no-extraneous-dependencies
import { core } from '@paypal/checkout-server-sdk';

export default (env, clientId, clientSecret) => {
  // new PayPal client instance
  const envMethod = env === 'sandbox' ? 'SandboxEnvironment' : 'LiveEnvironment';
  const environment = new core[envMethod](clientId, clientSecret);
  return new core.PayPalHttpClient(environment);
};
