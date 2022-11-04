/* eslint-disable import/no-extraneous-dependencies */
import url from 'url';
import fs from 'fs';
import { test, expect } from 'vitest';
import sendMail from '../src/index';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const readFile = (path: string) => fs.readFileSync(`${__dirname}/${path}`, 'utf-8');

const readJson = (path: string) => JSON.parse(readFile(path));

const config = readJson('config-smtp.json');
const order = readJson('assets/order.json');
const store = readJson('assets/store.json');
const customer = readJson('assets/customer.json');
const templateNewOrder = readFile('templates/new-order.ejs');

const header = {
  to: config.to,
  subject: '',
};

const {
  ecomStoreId,
  ecomAuthenticationId,
  ecomApiKey,
  smtp,
} = config;

process.env.ECOM_STORE_ID = ecomStoreId;
process.env.ECOM_AUTHENTICATION_ID = ecomAuthenticationId;
process.env.ECOM_API_KEY = ecomApiKey;

const timeOut = 10000;

test('Error settings not found', async () => {
  const data = await sendMail({
    ...header,
    templateData: {
      store,
      order,
      customer,
    },
    template: 'new_order',
  });
  expect(data?.status).toBe(404);
}, timeOut);

test('Error template not found', async () => {
  process.env.SMTP_HOST = smtp.host;
  process.env.SMTP_PORT = smtp.port;
  process.env.SMTP_USER = smtp.user;
  process.env.SMTP_PASS = smtp.pass;
  process.env.MAIL_SENDER = config.from.email;
  process.env.MAIL_SENDER_NAME = config.from.name;

  const data = await sendMail({
    ...header,
    templateData: {
      store,
      order,
      customer,
    },
  });
  expect(data?.status).toBe(404);
}, timeOut);

test('Send email with template for order', async () => {
  header.subject = 'Test email with order template, using smtp';
  const data = await sendMail({
    ...header,
    templateData: {
      store,
      order,
      customer,
    },
    template: templateNewOrder,
  });
  expect(data?.status).toBe(202);
}, timeOut);
