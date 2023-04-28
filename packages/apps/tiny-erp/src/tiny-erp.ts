/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
import functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './event-to-tiny';
import handleTinyWebhook from './tiny-webhook';

const { httpsFunctionOptions } = config.get();
const { region } = httpsFunctionOptions;

export const tinyerp = {
  onStoreEvent: createAppEventsFunction(
    'tinyErp',
    handleApiEvent as ApiEventHandler,
  ),

  webhook: functions
    .region(region)
    .runWith(httpsFunctionOptions)
    .https.onRequest(handleTinyWebhook),
};
