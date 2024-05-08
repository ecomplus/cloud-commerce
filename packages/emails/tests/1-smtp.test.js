import url from 'node:url';
import fs from 'node:fs';
import {
  test,
  describe,
  before,
} from 'node:test';
import assert from 'node:assert';
import Email from '../lib/index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const readFile = (path) => {
  return fs.readFileSync(`${__dirname}/${path}`, 'utf-8');
};

const readJson = (path) => JSON.parse(readFile(path));

const config = {};
const order = readJson('assets/order.json');
const store = readJson('assets/store.json');
const customer = readJson('assets/customer.json');
const templateNewOrder = readFile('templates/new-order.ejs');

describe('Test Erros SMTP', async () => {
  before(() => {
    config.smtpHost = process.env.SMTP_HOST;
    config.smtpPort = process.env.SMTP_PORT;
    config.smtpUser = process.env.SMTP_USER;
    config.smtpPass = process.env.SMTP_PASS;

    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SENDGRID_API_KEY;
  });

  test('Variables for SMTP configuration not found ', () => {
    const email = new Email();
    assert.throws(
      () => email.setConfigSmtp(),
      { message: 'Variables for SMTP configuration not found' },
    );
  });

  test('No email provider not configured', async () => {
    const templateData = {
      store,
      order,
      customer,
    };
    const email = new Email();

    email.setSubject('Test email with order template, using smtp')
      .setHtml(templateNewOrder, templateData);

    await email.sendEmail()
      .catch((err) => {
        assert.equal(err.message, 'No email provider not configured');
      });
  });

  test('Recipient not configured', async () => {
    const templateData = {
      store,
      order,
      customer,
    };
    const email = new Email();

    await email.setSubject('Test email with order template, using smtp')
      .setHtml(templateNewOrder, templateData);

    await email.sendEmail()
      .catch((err) => {
        assert.equal(err.message, 'Recipient not configured');
      });
  });

  test('Recipient are not of type EmailAddress', async () => {
    const templateData = {
      store,
      order,
      customer,
    };
    const email = new Email();
    let response;
    try {
      await email.setSubject('Test email with order template, using smtp')
        .setTo(process.env.TO_EMAIL)
        .setHtml(templateNewOrder, templateData);

      await email.sendEmail();
    } catch (err) {
      response = err;
    }

    assert.equal(response.message, 'Recipient are not of type EmailAddress');
  });

  test('Recipients are not of type EmailAddress', async () => {
    const templateData = {
      store,
      order,
      customer,
    };
    const email = new Email();
    try {
      email.setSubject('Test email with order template, using smtp')
        .setTo([process.env.TO_EMAIL])
        .setHtml(templateNewOrder, templateData);

      await email.sendEmail();
    } catch (err) {
      assert.equal(err.message, 'Recipients are not of type EmailAddress');
    }
  });
});

/*
describe('Test SMTP', async () => {
  test('Send email with template for order', async () => {
    process.env.SMTP_HOST = config.smtpHost;
    process.env.SMTP_PORT = config.smtpPort;
    process.env.SMTP_USER = config.smtpUser;
    process.env.SMTP_PASS = config.smtpPass;

    const templateData = {
      store,
      order,
      customer,
    };
    const email = new Email();

    email.setSubject('Test email with order template, using smtp')
      .setTo([{ email: process.env.TO_EMAIL }])
      .setHtml(templateNewOrder, templateData);

    const data = await email.sendEmail();
    assert.equal(data.status, 202);
  });
});
// */
