/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import handleWebhook from './functions-lib/handle-webhook';

const { httpsFunctionOptions } = config.get();

export const paghiper = {
  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest((req, res) => {
      if (req.method !== 'POST') {
        res.sendStatus(405);
      } else {
        handleWebhook(req, res);
      }
    }),
};
