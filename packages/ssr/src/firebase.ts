/* eslint-disable import/prefer-default-export, import/no-unresolved, import/first */
import '@cloudcommerce/api/fetch-polyfill';
import { initializeApp } from 'firebase-admin/app';

initializeApp();

import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import serveStorefront from './firebase/serve-storefront';

const {
  httpsFunctionOptions: {
    region,
    timeoutSeconds,
    memory,
    minInstances,
  },
} = config.get();

export const ssr = onRequest({
  region,
  timeoutSeconds: timeoutSeconds || 15,
  memory: memory || '256MiB',
  minInstances: minInstances || 1,
}, (req, res) => {
  serveStorefront(req, res);
});
