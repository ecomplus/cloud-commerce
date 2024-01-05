/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './events-to-affiliate-program';

export const affiliateapp = {
  onStoreEvent: createAppEventsFunction(
    'affiliateProgram',
    handleApiEvent as ApiEventHandler,
  ),
};
