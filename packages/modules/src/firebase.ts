/* eslint-disable import/prefer-default-export */
import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import serveModulesApi from './firebase/serve-modules-api';

const {
  httpsFunctionOptions: { region },
  modulesFunctionOptions: { memory },
} = config.get();

export const modules = onRequest({
  concurrency: 24,
  region,
  memory,
}, (req, res) => {
  serveModulesApi(req, res);
});
