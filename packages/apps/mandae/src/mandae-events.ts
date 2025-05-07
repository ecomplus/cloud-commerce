/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import sendWaitingOrders from './mandae-send-orders';
import trackOrders from './mandae-track-orders';

export const mandae = {
  cronSendOrders: functions
    .region(config.get().httpsFunctionOptions.region)
    .pubsub.schedule(process.env.CRONTAB_MANDAE_SEND_ORDERS || '32,51 * * * *')
    .onRun(() => sendWaitingOrders()),

  cronTrackOrders: functions
    .region(config.get().httpsFunctionOptions.region)
    .pubsub.schedule(process.env.CRONTAB_MANDAE_TRACK_ORDERS || '12,47 * * * *')
    .onRun(() => trackOrders()),
};
