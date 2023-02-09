/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './events-to-webhooks-app';

export const webhooksapp = {
  onStoreEvent: createAppEventsFunction(
    'webhooksApp',
    handleApiEvent as ApiEventHandler,
  ),
};
