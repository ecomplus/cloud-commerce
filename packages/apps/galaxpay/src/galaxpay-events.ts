/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './functions-lib/ecom/events-to-galaxpay';
import handleGalaxpayWebhook from './functions-lib/galaxpay/webhook';

export const galaxpay = {
  onStoreEvent: createAppEventsFunction(
    'galaxPay',
    handleApiEvent as ApiEventHandler,
  ),

  webhook: functions
    .region(config.get().httpsFunctionOptions.region)
    .https.onRequest((req, res) => {
      if (req.method !== 'POST') {
        res.sendStatus(405);
      } else {
        handleGalaxpayWebhook(req, res);
      }
    }),
};
