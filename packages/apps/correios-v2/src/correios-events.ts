/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
// import logger from 'firebase-functions/logger';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import {
  createPubSubFunction,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import runDb from '../lib-mjs/correios-db/pubsub/run-database.mjs';
import fillDb from '../lib-mjs/correios-db/fill-database.mjs';
import topicName from '../lib-mjs/correios-db/pubsub/get-topic-name.mjs';

export const correiosv2 = {
  fillDatabase: createPubSubFunction(topicName(), fillDb),
  cronTrackingCodes: functions.region(config.get().httpsFunctionOptions.region).pubsub
    .schedule('26 10 26 3,9 *')
    .onRun(() => {
      return runDb();
    }),
};
