/* eslint-disable import/prefer-default-export */
// import './init';
import functions from 'firebase-functions';
import config from './config';
import checkStoreEvents from './handlers/check-store-events';

const { httpsFunctionOptions: { region } } = config.get();

const functionBuilder = functions
  .region(region)
  .runWith({
    timeoutSeconds: 300,
    memory: '256MB',
  });

export const cronStoreEvents = functionBuilder.pubsub
  .schedule(process.env.CRONTAB_STORE_EVENTS || '* * * * *')
  .onRun(() => {
    return checkStoreEvents();
  });
