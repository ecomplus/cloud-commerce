/* eslint-disable import/prefer-default-export, import/first */
import { initializeApp } from 'firebase-admin/app';

initializeApp();

import functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import serveStorefront from './firebase/serve-storefront';

const { httpsFunctionOptions, ssrFunctionOptions } = config.get();
const { region } = httpsFunctionOptions;

export const ssr = functions
  .region(ssrFunctionOptions.region || region)
  .runWith(ssrFunctionOptions)
  .https.onRequest(serveStorefront);

export const feeds = functions
  .region(region)
  .runWith({
    ...httpsFunctionOptions,
    memory: '512MB',
    timeoutSeconds: 120,
  })
  .https.onRequest(serveStorefront);
