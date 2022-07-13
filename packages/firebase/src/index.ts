import 'source-map-support/register.js';
import * as functions from 'firebase-functions';
import config from './config';

export const hello = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', {
    structuredData: true,
  });
  response.send(config.get().hello);
});

export const info = functions.https.onRequest((request, response) => {
  response.send({
    config: config.get(),
  });
});

export const ssr = functions.https.onRequest((request, response) => {
  response.send('<h1>Hello SSR!</h1>');
});
