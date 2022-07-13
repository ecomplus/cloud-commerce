import 'source-map-support/register.js';
import { logger } from 'firebase-functions';
// eslint-disable-next-line import/no-unresolved
import { onRequest } from 'firebase-functions/v2/https';
import config from './config';

const options = {
  region: process.env.DEPLOY_REGION || 'us-east1',
};

const processId = String(Date.now());

export const z = onRequest(options, ({ url }, response) => {
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
