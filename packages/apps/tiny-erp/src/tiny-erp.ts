/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
// eslint-disable-next-line import/no-unresolved
import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './event-to-tiny';
import handleTinyWebhook from './tiny-webhook';

const { httpsFunctionOptions } = config.get();

export const tinyErpOnApiEvent = createAppEventsFunction(
  'tinyErp',
  handleApiEvent as ApiEventHandler,
);

export const tinyErpWebhook = onRequest(httpsFunctionOptions, (req, res) => {
  handleTinyWebhook(req, res);
});
