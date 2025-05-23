/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import { createAppEventsFunction } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from '../lib-mjs/events-to-pagarme5.mjs';
import handlePagarmeV5Webhook from '../lib-mjs/pagarme5-webhook.mjs';
import cancelExpiredOrders from './pagarme-cancel-expireds';

const { httpsFunctionOptions } = config.get();

export const pagarmev5 = {
  onStoreEvent: createAppEventsFunction('pagarMeV5', handleApiEvent),

  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest((req, res) => {
      if (req.method !== 'POST') {
        res.sendStatus(405);
      } else {
        handlePagarmeV5Webhook(req, res);
      }
    }),

  cronCancelExpireds: functions
    .region(config.get().httpsFunctionOptions.region)
    .pubsub.schedule(process.env.CRONTAB_PAGARME_CANCEL_EXPIREDS || '22 * * * *')
    .onRun(() => cancelExpiredOrders()),
};
