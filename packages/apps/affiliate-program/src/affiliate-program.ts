/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import { createAppEventsFunction } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './events-to-affiliate-program';

export const affiliate = {
  onStoreEvent: createAppEventsFunction('affiliateProgram', handleApiEvent),
};
