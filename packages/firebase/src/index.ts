/* eslint-disable import/prefer-default-export */

import 'source-map-support/register.js';
import '@cloudcommerce/api/fetch-polyfill.js';
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { initializeApp } from 'firebase-admin/app';
import { pubsub } from 'firebase-functions';
import checkStoreEvents from './handlers/check-store-events';

initializeApp();

// eslint-disable-next-line camelcase
export const cron_store_events = pubsub.schedule('* * * * *').onRun(() => {
  return checkStoreEvents();
});
