/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './functions-lib/events-to-melhor-envio';
import handleTrackingCodes from './functions-lib/tracking-codes';

export const melhorenvio = {
  cronTrackingCodes: functions.region(config.get().httpsFunctionOptions.region).pubsub
    .schedule(process.env.CRONTAB_MELHORENVIO_TRACKING_CODES || '19 * * * *')
    .onRun(() => {
      return handleTrackingCodes();
    }),

  onStoreEvent: createAppEventsFunction(
    'melhorEnvio',
    handleApiEvent as ApiEventHandler,
  ),
};
