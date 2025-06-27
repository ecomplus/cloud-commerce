/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import { createAppEventsFunction } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import sendAbandonedCarts from './evendas-send-carts';
import handleApiEvent from './event-to-evendas';

export const webhooks = {
  onStoreEvent: createAppEventsFunction('evendas', handleApiEvent),

  cronCancelExpireds: functions
    .region(config.get().httpsFunctionOptions.region)
    .runWith({ timeoutSeconds: 540 })
    .pubsub.schedule(process.env.CRONTAB_EVENDAS_SEND_CARTS || '47 * * * *')
    .onRun(() => sendAbandonedCarts()),
};
