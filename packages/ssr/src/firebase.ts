/* eslint-disable import/no-unresolved, import/first */
import '@cloudcommerce/api/fetch-polyfill';
import { initializeApp } from 'firebase-admin/app';

initializeApp();

import functions from 'firebase-functions';
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

// eslint-disable-next-line import/prefer-default-export
export const ssr = functions
  .region(region)
  .runWith({
    timeoutSeconds: timeoutSeconds || 15,
    memory: memory ? memory.replace('i', '') as '256MB' : '256MB',
    minInstances: minInstances || 1,
  }).https.onRequest((req, res) => {
    serveStorefront(req, res);
  });
