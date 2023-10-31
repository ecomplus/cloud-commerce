/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from '../lib-mjs/pagarme-events-api.mjs';
import handlePagarmeV5Webhook from '../lib-mjs/pagarme-webhooks.mjs';

export const galaxpay = {
  onStoreEvent: createAppEventsFunction(
    'pagarMeV5',
    handleApiEvent as ApiEventHandler,
  ),
  webhooks: functions
    .region(config.get().httpsFunctionOptions.region)
    .https.onRequest((req, res) => {
      if (req.method !== 'POST') {
        res.sendStatus(405);
      } else {
        handlePagarmeV5Webhook(req, res);
      }
    }),
};
