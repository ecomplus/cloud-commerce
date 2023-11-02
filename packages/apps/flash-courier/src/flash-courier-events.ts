/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import handleTrackingCodes from '../lib-mjs/update-tracking.mjs';

export const flashcourier = {
  cronTrackingCodes: functions.region(config.get().httpsFunctionOptions.region).pubsub
    .schedule(process.env.CRONTAB_FLASHCOURIER_TRACKING_CODES || '19 * * * *')
    .onRun(() => {
      return handleTrackingCodes();
    }),
};
