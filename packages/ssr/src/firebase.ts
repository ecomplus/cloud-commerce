/* eslint-disable import/prefer-default-export, import/first */
import { initializeApp } from 'firebase-admin/app';

initializeApp();

import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import serveStorefront from './lib/serve-storefront';

const { ssrFunctionOptions } = config.get();

export const ssr = onRequest({
  concurrency: 80,
  ...ssrFunctionOptions,
}, serveStorefront);
