/* eslint-disable import/prefer-default-export */

import 'source-map-support/register.js';
// eslint-disable-next-line import/no-unresolved
import { initializeApp } from 'firebase-admin/app';
// eslint-disable-next-line import/no-unresolved
import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import getEnv from '@cloudcommerce/firebase/lib/env';
import serveModulesApi from './firebase/serve-modules-api';

initializeApp();
const { httpsFunctionOptions } = config.get();

export const modules = onRequest(httpsFunctionOptions, (req, res) => {
  const { apiAuth } = getEnv();
  // Hide API key for security
  process.env.ECOM_API_KEY = '***';
  serveModulesApi(req, res, apiAuth);
});
