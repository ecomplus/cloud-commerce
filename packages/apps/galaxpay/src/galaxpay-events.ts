/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import { createAppEventsFunction } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './functions-lib/ecom/events-to-galaxpay';
import handleGalaxpayWebhook from './functions-lib/galaxpay/webhook';

const { httpsFunctionOptions } = config.get();

export const galaxpay = {
  onStoreEvent: createAppEventsFunction('galaxPay', handleApiEvent),

  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest((req, res) => {
      if (req.method !== 'POST') {
        res.sendStatus(405);
      } else {
        handleGalaxpayWebhook(req, res);
      }
    }),
};
