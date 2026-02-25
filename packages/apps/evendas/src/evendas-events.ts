/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import sendAbandonedCarts from './evendas-send-carts';

export const evendas = {
  cronCancelExpireds: functions
    .region(config.get().httpsFunctionOptions.region)
    .pubsub.schedule(process.env.CRONTAB_EVENDAS_SEND_CARTS || '47 * * * *')
    .onRun(() => sendAbandonedCarts()),
};
