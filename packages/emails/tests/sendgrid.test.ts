import url from 'node:url';
import fs from 'node:fs';
import { test, expect } from 'vitest';
import email, { sendGrid } from '../src/index';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const readFile = (path: string) => fs.readFileSync(`${__dirname}/${path}`, 'utf-8');

const readJson = (path: string) => JSON.parse(readFile(path));

const config = readJson('config-sendgrid.json');
const order = readJson('assets/order.json');
const store = readJson('/assets/store.json');
const customer = readJson('/assets/customer.json');
const templateNewOrder = readFile('templates/new-order.ejs');

const header = {
  to: config.to,
  subject: '',
};

process.env.ECOM_STORE_ID = config.ecomStoreId;
process.env.ECOM_AUTHENTICATION_ID = config.ecomAuthenticationId;
process.env.ECOM_API_KEY = config.ecomApiKey;

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
  process.env.SENDGRID_API_KEY = config.apiKey;
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
    expect(err.message).toBe('TemplateId, template or html not found');
  }
}, timeOut);

test('Send email with templateId for order', async () => {
  header.subject = 'Test email with order templateId';
  const data = await email.send({
    ...header,
    templateData: {
      store,
      order,
      customer,
    },
    templateId: config.templateIdOrders,
  });
  expect(data?.status).toBe(202);
}, timeOut);

test('Send email with template for order', async () => {
  header.subject = 'Test email with order template';
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

test('Send email retry with template for templateId error', async () => {
  header.subject = 'Test retry email';
  const data = await email.send({
    ...header,
    templateData: {
      store,
      order,
      customer,
    },
    templateId: 'd-00000000000000000000000000000000',
    template: templateNewOrder,
  });
  expect(data?.status).toBe(202);
}, timeOut * 1.5);

test('Error templateId not found', async () => {
  header.subject = 'Test email, templateId error';
  try {
    await email.send({
      ...header,
      templateData: {
        store,
        order,
        customer,
      },
      templateId: 'd-00000000000000000000000000000000',
    });
  } catch (err: any) {
    expect(err.response.status).toBe(400);
  }
}, timeOut);

test('Unauthorized Error API Key', async () => {
  sendGrid.setConfig('dadasdas');
  header.subject = 'Test email, Unauthorized Error API Key';
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
    expect(err.response.status).toBe(401);
  }
}, timeOut);

test('Back to original sendGrid settings', async () => {
  sendGrid.setConfig(config.apiKey);
  header.subject = 'Test email with order templateId';
  const data = await email.send({
    ...header,
    templateData: {
      store,
      order,
      customer,
    },
    templateId: config.templateIdOrders,
  });
  expect(data?.status).toBe(202);
}, timeOut);
