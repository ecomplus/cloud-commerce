/* eslint-disable import/prefer-default-export, import/first */
import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import serveFeeds from './firebase/serve-feeds';

const { ssrFunctionOptions } = config.get();

export const feeds = onRequest({
  concurrency: 80,
  ...ssrFunctionOptions,
  memory: '512MiB',
  timeoutSeconds: 120,
}, serveFeeds);
