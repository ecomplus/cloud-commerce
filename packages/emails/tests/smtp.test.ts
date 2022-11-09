/* eslint-disable import/no-extraneous-dependencies */
import url from 'url';
import fs from 'fs';
import { test, expect } from 'vitest';
import email, { smtp as smtpSend } from '../src/index';

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

process.env.MAIL_SENDER = config.from.email;
process.env.MAIL_SENDER_NAME = config.from.name;

const timeOut = 10000;

test('Error settings not found', async () => {
  try {
    await email.send({
      ...header,
      templateData: {
        store,
        order,
        customer,
      },
      template: templateNewOrder,
    });
  } catch (err: any) {
    expect(err.message).toBe('Provider settings or smtp not found');
  }
}, timeOut);

test('Error template not found', async () => {
  process.env.SMTP_HOST = smtp.host;
  process.env.SMTP_PORT = smtp.port;
  process.env.SMTP_USER = smtp.user;
  process.env.SMTP_PASS = smtp.pass;

  try {
    await email.send({
      ...header,
      templateData: {
        store,
        order,
        customer,
      },
    });
  } catch (err: any) {
    expect(err?.message).toBe('TemplateId, template or html not found');
  }
}, timeOut);

test('Send email with template for order', async () => {
  header.subject = 'Test email with order template, using smtp';
  const data = await email.send({
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

test('Smtp configuration error', async () => {
  smtpSend.setConfig({
    host: 'smtp',
    port: 453,
    secure: true,
    auth: { user: 'user', pass: 'pass' },
  });
  try {
    header.subject = 'Test email with order template, using smtp';
    await email.send({
      ...header,
      templateData: {
        store,
        order,
        customer,
      },
      template: templateNewOrder,
    });
    // expect(data?.status).toBe(202);
  } catch (err: any) {
    expect(err.message).toBe('getaddrinfo ENOTFOUND smtp');
  }
}, timeOut);

test('Back to original smtp settings', async () => {
  smtpSend.setConfig({
    host: smtp.host,
    port: smtp.port,
    secure: false,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  header.subject = 'Back to original smtp settings, using smtp';
  const data = await email.send({
    ...header,
    templateData: {
      store,
      order,
      customer,
    },
    template: templateNewOrder,
  });
  expect(data?.status).toBe(202);
}, timeOut * 1.5);

test('Another email send test, to confirm smtp configuration', async () => {
  header.subject = 'Test email to confirm smtp configuration';
  const data = await email.send({
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
