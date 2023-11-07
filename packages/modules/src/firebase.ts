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
  if (!process.env.MODULES_DISABLE_CORS) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '600');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type, X-Store-ID, X-My-ID, X-Access-Token',
    );
    if (req.method === 'OPTIONS') {
      res.end();
      return;
    }
  }
  serveModulesApi(req, res);
});
