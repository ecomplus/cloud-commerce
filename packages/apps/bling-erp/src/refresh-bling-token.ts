import * as logger from 'firebase-functions/logger';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';
import createAccess from './bling-auth/create-access';

/*
Keeps the Bling access token fresh, refreshing it more than 1h before expiration,
so the stored `refresh_token` never gets too old.
*/
export const refreshBlingToken = async () => {
  const appData = await getAppData('blingErp', ['hidden_data', 'data']);
  const { client_id: clientId, client_secret: clientSecret } = appData;
  if (!clientId || !clientSecret) {
    logger.warn('Missing Bling client_id/client_secret');
    return;
  }
  try {
    await createAccess(clientId, clientSecret, (1000 * 60 * 60) + (1000 * 60 * 10));
    logger.info('Checked Bling token');
  } catch (err: any) {
    if (err.code === 'NO_BLING_TOKEN') {
      logger.info('Bling app is not authorized yet');
      return;
    }
    logger.warn(err);
  }
};

export default refreshBlingToken;
