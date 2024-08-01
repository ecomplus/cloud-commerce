/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
import functions from 'firebase-functions/v1';
import config, { createExecContext } from '@cloudcommerce/firebase/lib/config';
import { createAppEventsFunction } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './event-to-tiny';
import handleTinyWebhook from './tiny-webhook';

const { httpsFunctionOptions } = config.get();
const { region } = httpsFunctionOptions;

export const tinyerp = {
  onStoreEvent: createAppEventsFunction(
    'tinyErp',
    handleApiEvent,
    { memory: '512MB' },
  ),

  webhook: functions
    .region(region)
    .runWith(httpsFunctionOptions)
    .https.onRequest((req, res) => {
      return createExecContext(() => handleTinyWebhook(req, res));
    }),
};
