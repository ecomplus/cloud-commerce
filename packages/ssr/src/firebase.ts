/* eslint-disable import/prefer-default-export, import/no-unresolved, import/first */
import '@cloudcommerce/api/fetch-polyfill';
import { initializeApp } from 'firebase-admin/app';

initializeApp();

import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import serveStorefront from './firebase/serve-storefront';

const { httpsFunctionOptions, ssrFunctionOptions } = config.get();

export const ssr = onRequest(ssrFunctionOptions, (req, res) => {
  serveStorefront(req, res);
});

export const feeds = onRequest({
  ...httpsFunctionOptions,
  timeoutSeconds: 120,
  memory: ssrFunctionOptions.memory,
}, (req, res) => {
  serveStorefront(req, res);
});
