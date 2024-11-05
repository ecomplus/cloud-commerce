/* eslint-disable import/prefer-default-export, import/first */
import { initializeApp } from 'firebase-admin/app';

initializeApp();

import { onRequest } from 'firebase-functions/v2/https';
import config, { createExecContext } from '@cloudcommerce/firebase/lib/config';
import serveStorefront from './lib/serve-storefront';

const { ssrFunctionOptions } = config.get();

export const ssr = onRequest({
  concurrency: 60,
  ...ssrFunctionOptions,
}, (req, res) => {
  return createExecContext(() => serveStorefront(req, res));
});
