/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import config from '@cloudcommerce/firebase/lib/config';
import functions from 'firebase-functions/v1';
import { createAppEventsFunction } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './event-to-emails';
// import handleAbandonedCarts from './functios-lib/abandoned-carts';

const { httpsFunctionOptions: { region } } = config.get();

export const emails = {
  onStoreEvent: createAppEventsFunction('emails', handleApiEvent),

  cronAbandonedCarts: functions.region(region).pubsub
    .schedule(process.env.CRONTAB_EMAILS_ABANDONED_CARTS || '25 */3 * * *')
    .onRun(() => {
      // TODO: Refactor abandoned carts handler
      functions.logger.info('// TODO');
    }),
};
