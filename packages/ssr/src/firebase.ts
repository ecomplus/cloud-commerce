/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
// eslint-disable-next-line import/no-unresolved
import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import serveStorefront from './firebase/serve-storefront';

const { httpsFunctionOptions } = config.get();

export const ssr = onRequest({
  timeoutSeconds: 15,
  memory: '256MiB',
  // minInstances: 1,
  ...httpsFunctionOptions,
}, (req, res) => {
  serveStorefront(req, res);
});
