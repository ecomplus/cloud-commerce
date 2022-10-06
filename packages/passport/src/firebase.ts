import '@cloudcommerce/firebase/lib/init';
// eslint-disable-next-line import/no-unresolved
import { HttpsOptions, onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import servePassportApi from './firebase/serve-passport-api';

const options = {
  memory: '128MiB',
  ...config.get().httpsFunctionOptions,
} as HttpsOptions;

// eslint-disable-next-line import/prefer-default-export
export const passport = onRequest(options, (req, res) => {
  servePassportApi(req, res);
});
