import logger from 'firebase-functions/logger';
import { getStore } from './utils.mjs';
// register PayPal notification webhook
import createPaypalWebhook from './paypal-api/create-webhook.mjs';
// create PayPal experience profile
import createPaypalProfile from './paypal-api/create-profile.mjs';

const ECHO_SKIP = (msg) => logger.warn(msg || 'SKIP');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async (trigger, application, app) => {
  const configObj = {
    ...application.data,
    ...application.hidden_data,
  };
  // logger.log(`Store webhook #${storeId}`)
  // treat E-Com Plus trigger body here
  // https://developers.e-com.plus/docs/api/#/store/triggers/

  // check if PayPal app credentials were edited
  if (trigger.body && (trigger.body.paypal_client_id || trigger.body.paypal_secret)) {
    // get app configured options
    const paypalClientId = configObj.paypal_client_id;
    const paypalSecret = configObj.paypal_secret;
    const paypalEnv = configObj.paypal_sandbox && 'sandbox';
    const store = getStore();

    if (paypalClientId && paypalSecret) {
      try {
        await createPaypalWebhook(
          paypalEnv,
          paypalClientId,
          paypalSecret,
        );

        await createPaypalProfile(
          paypalEnv,
          paypalClientId,
          paypalSecret,
          store.name,
          store.logo && store.logo.url,
          store.domain && `https://${store.domain}/app/#/confirmation/`,
          store.languages && store.languages.length
          && store.languages[0].replace(/^[a-z]{2}_?/, '').toUpperCase(),
        );

        // done
        return null;
      } catch (err) {
        logger.error(err);
        return null;
      }
    }
  }
  // nothing to do
  ECHO_SKIP();
  return null;
};
