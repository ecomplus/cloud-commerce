/* eslint-disable import/no-extraneous-dependencies */

import url from 'url';
import path from 'path';
import { test, expect } from 'vitest';
import { fs } from 'zx';
import sendMail from '../src/index';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const config = fs.readJSONSync(path.join(__dirname, '/config-sendgrid.json'));
const order = fs.readJSONSync(path.join(__dirname, '/assets/order.json'));
const store = fs.readJSONSync(path.join(__dirname, '/assets/store.json'));

const header = {
  from: config.from,
  to: config.to,
  subject: '',
};

process.env.ECOM_STORE_ID = config.ecomStoreId;
process.env.ECOM_AUTHENTICATION_ID = config.ecomAuthenticationId;
process.env.ECOM_API_KEY = config.ecomApiKey;

process.env.PROVIDER_MAIL_USER = config.from.name;
process.env.MAIN_EMAIL = config.from.email;
process.env.PROVIDER_MAIL_PASS = config.apiKey;

test('Send email with templateId for order', async () => {
  header.subject = 'Test Email';
  const data = await sendMail(
    header,
    { store, order },
    config.templateIdOrders,
  ) as any;
  expect(data.status).toBe(202);
}, 10000);
