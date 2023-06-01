/* eslint-disable import/prefer-default-export, import/first */
import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import serveFeeds from './firebase/serve-feeds';

const {
  httpsFunctionOptions: { region },
} = config.get();

export const feeds = onRequest({
  concurrency: 300,
  region,
  memory: '512MiB',
  timeoutSeconds: 120,
}, serveFeeds);
