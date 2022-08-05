/* eslint-disable import/prefer-default-export */

import 'source-map-support/register.js';
import '@cloudcommerce/api/fetch-polyfill.js';
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { initializeApp } from 'firebase-admin/app';
import functions from 'firebase-functions';
import config from './config';
import checkStoreEvents from './handlers/check-store-events';

initializeApp();

const { httpsFunctionOptions: { region } } = config.get();

export const cronStoreEvents = functions.region(region)
  .pubsub.schedule('* * * * *').onRun(() => {
    return checkStoreEvents();
  });
