/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import config from '@cloudcommerce/firebase/lib/config';
import functions from 'firebase-functions';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './events-to-app-emails';
import handleAbandonedCarts from './functios-lib/abandoned-carts';

const { httpsFunctionOptions: { region } } = config.get();

export const emails = {
  onStoreEvent: createAppEventsFunction(
    'emails',
    handleApiEvent as ApiEventHandler,
  ),

  cronAbandonedCarts: functions.region(region).pubsub
    .schedule(process.env.CRONTAB_EMAILS_ABANDONED_CARTS || '25 */3 * * *')
    .onRun(() => {
      return handleAbandonedCarts();
    }),
};
