/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import config from '@cloudcommerce/firebase/lib/config';
import functions from 'firebase-functions/v1';
import handleTrackingCodes from './functions-lib/tracking-codes';
import removeDeliveredToFirestore from './functions-lib/remove-delivered';

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
};
