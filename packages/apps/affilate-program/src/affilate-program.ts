/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './events-to-affilate-program';

export const affilateapp = {
  onStoreEvent: createAppEventsFunction(
    'affilateProgram',
    handleApiEvent as ApiEventHandler,
  ),
};
