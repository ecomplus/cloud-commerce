/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import serveModulesApi from './firebase/serve-modules-api';

const { httpsFunctionOptions } = config.get();

export const modules = onRequest({
  concurrency: 12,
  ...httpsFunctionOptions,
}, (req, res) => {
  serveModulesApi(req, res);
});
