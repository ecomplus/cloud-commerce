/* eslint-disable import/first */
import 'source-map-support/register.js';
import '@cloudcommerce/api/fetch-polyfill.js';
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { initializeApp } from 'firebase-admin/app';

initializeApp();
