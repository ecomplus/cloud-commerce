/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import handleVindiWebhook from '../lib-mjs/vindi-webhook.mjs';

const { httpsFunctionOptions } = config.get();

export const vindi = {
  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest((req, res) => {
      if (req.method !== 'POST') {
        res.sendStatus(405);
      } else {
        handleVindiWebhook(req, res);
      }
    }),
};
