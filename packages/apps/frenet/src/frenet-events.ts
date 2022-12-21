/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import config from '@cloudcommerce/firebase/lib/config';
import functions from 'firebase-functions/v1';
import handleTrackingCodes from './functions-lib/tracking-codes';
import removeDeliveredToFirestore from './functions-lib/remove-delivered';
import db from './functions-lib/database';
import handleApiEvent from './functions-lib/events-to-frenet';

const { httpsFunctionOptions: { region } } = config.get();

export const frenet = {
  cronTrackingCodes: functions.region(region).pubsub
    .schedule('*/30 * * * *')
    .onRun(() => {
      return handleTrackingCodes;
    }),

  cronRemoveDelivered: functions.region(region).pubsub
    .schedule('*/30 * * * *')
    .onRun(() => {
      return removeDeliveredToFirestore;
    }),

  cronRemoveOldTrackingCodes: functions.region(region).pubsub
    .schedule('30 */24 * * *')
    .onRun(() => {
      return db.clear();
    }),

  onStoreEvent: createAppEventsFunction(
    'frenet',
    handleApiEvent as ApiEventHandler,
  ),
};
