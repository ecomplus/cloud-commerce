import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import logger from 'firebase-functions/logger';
import handleApp from '../lib-mjs/events-to-paypal.mjs';

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const appData = { ...app.data, ...app.hidden_data };
  const resourceId = apiEvent.resource_id;
  const key = `${evName}_${resourceId}`;

  if (
    Array.isArray(appData.ignore_events)
    && appData.ignore_events.includes(evName)
  ) {
    logger.info('>> ', key, ' - Ignored event');
    return null;
  }

  return handleApp(apiEvent, app, apiDoc);
};

// eslint-disable-next-line import/prefer-default-export
export const paypal = {
  onStoreEvent: createAppEventsFunction(
    'payPal',
    handleApiEvent as ApiEventHandler,
  ),
  webhook: functions
    .region(config.get().httpsFunctionOptions.region)
    .https.onRequest((req, res) => {
      if (req.method !== 'POST') {
        res.sendStatus(405);
      } else {
        // handlePayPalWebhook(req, res);
      }
    }),
};
