/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import config from '@cloudcommerce/firebase/lib/config';
import functions from 'firebase-functions/v1';
import handleTrackingCodes from './functions-lib/tracking-codes';
import handleApiEvent from './functions-lib/events-to-frenet';

const { httpsFunctionOptions: { region } } = config.get();

export const frenet = {
  cronTrackingCodes: functions.region(region).pubsub
    .schedule(process.env.CRONTAB_FRENET_TRACKING_CODES || '19 * * * *')
    .onRun(() => {
      return handleTrackingCodes();
    }),

  onStoreEvent: createAppEventsFunction(
    'frenet',
    handleApiEvent as ApiEventHandler,
  ),
};
