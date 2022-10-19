/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import config from '@cloudcommerce/firebase/lib/config';
import functions from 'firebase-functions';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './events-to-sendgrid';
import handleAbandonedCarts from './functios-to-sendgrid/abandoned-carts';

const { httpsFunctionOptions: { region } } = config.get();

const functionBuilder = functions
  .region(region)
  .runWith({
    timeoutSeconds: 300,
    memory: '128MB',
  });

export const sendgrid = {
  onStoreEvent: createAppEventsFunction(
    'sendGrid',
    handleApiEvent as ApiEventHandler,
  ),

  sendAbandonedCartsEmail: functionBuilder.pubsub
    .schedule('25 */3 * * *')
    .onRun(() => {
      return handleAbandonedCarts();
    }),
};
