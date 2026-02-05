/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
import functions from 'firebase-functions/v1';
import config, { createExecContext } from '@cloudcommerce/firebase/lib/config';
import { createAppEventsFunction } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './event-to-tiny';
import handleTinyWebhook from './tiny-webhook';
import sendWaitingOrders from './tiny-erp-send-orders';

const { httpsFunctionOptions } = config.get();
const { region } = httpsFunctionOptions;

export const tinyerp = {
  onStoreEvent: createAppEventsFunction(
    'tinyErp',
    handleApiEvent,
    { memory: '512MB' },
  ),

  webhook: functions
    .region(region)
    .runWith({
      ...httpsFunctionOptions,
      memory: '512MB',
      timeoutSeconds: 120,
    })
    .https.onRequest((req, res) => {
      return createExecContext(() => handleTinyWebhook(req, res));
    }),

  cronSendOrders: functions
    .region(region)
    .runWith({ timeoutSeconds: 540, memory: '512MB' })
    .pubsub.schedule(process.env.CRONTAB_TINYERP_SEND_ORDERS || '17 */3 * * *')
    .onRun(() => sendWaitingOrders()),
};
