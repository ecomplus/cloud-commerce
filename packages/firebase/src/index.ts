import 'source-map-support/register.js';
import '@cloudcommerce/api/fetch-polyfill.js';
import { initializeApp } from 'firebase-admin';
import { pubsub, logger } from 'firebase-functions';
// eslint-disable-next-line import/no-unresolved
import { onRequest } from 'firebase-functions/v2/https';
import config from './config';
import checkStoreEvents from './handlers/check-store-events';

initializeApp();
const processId = String(Date.now());
const options = {
  region: process.env.DEPLOY_REGION || 'us-east1',
};

export const z = onRequest(options, ({ url }, response) => {
  process.env.ECOM_API_KEY = '***';
  if (url === '/hello') {
    logger.info('Hello logs!', {
      structuredData: true,
    });
    response.send(config.get().hello);
    return;
  }
  if (url === '/pid') {
    response.send(processId);
    return;
  }
  response.send({
    config: config.get(),
  });
});

export const ssr = onRequest(options, (request, response) => {
  response.send('<h1>Hello SSR!</h1>');
});

export const cronStoreEvents = pubsub.schedule('* * * * *').onRun(() => {
  return checkStoreEvents();
});
