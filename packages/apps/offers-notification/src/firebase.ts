/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
// eslint-disable-next-line import/no-unresolved
import config from '@cloudcommerce/firebase/lib/config';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
// eslint-disable-next-line import/no-unresolved
import * as functions from 'firebase-functions/v1';
import handleApiEvent from './event-to-offers-notification';
import handleWebhook from './functions-to-offers-notification/webhook';

export const offersNotification = {
  onStoreEvent: createAppEventsFunction(
    'offersNotification',
    handleApiEvent as ApiEventHandler,
  ),
  webhook: functions
    .region(config.get().httpsFunctionOptions.region)
    .https.onRequest(async (req, res) => {
      handleWebhook(req, res);
    }),
};
