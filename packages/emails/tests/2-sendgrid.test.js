// import url from 'node:url';
// import fs from 'node:fs';
import {
  test,
  describe,
  before,
} from 'node:test';
import assert from 'node:assert';
import Email from '../lib/index.js';

// const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// const readFile = (path) => {
//   return fs.readFileSync(`${__dirname}/${path}`, 'utf-8');
// };

// const readJson = (path) => JSON.parse(readFile(path));

const config = {};
// const order = readJson('assets/order.json');
// const store = readJson('assets/store.json');
// const customer = readJson('assets/customer.json');
// const templateNewOrder = readFile('templates/new-order.ejs');

describe('Test Erros SendGrid', async () => {
  before(() => {
    config.smtpHost = process.env.SMTP_HOST;
    config.smtpPort = process.env.SMTP_PORT;
    config.smtpUser = process.env.SMTP_USER;
    config.smtpPass = process.env.SMTP_PASS;
    config.sendgridApiKey = process.env.SENDGRID_API_KEY;

    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SENDGRID_API_KEY;
  });

  test('Variable SENDGRID_API_KEY not configured', () => {
    const email = new Email();
    assert.throws(
      () => email.setSendGridApi(),
      { message: 'Variable SENDGRID_API_KEY not configured' },
    );
  });

  test('TemplateId not found', async () => {
    process.env.SENDGRID_API_KEY = config.sendgridApiKey;
    const email = new Email();
    await email.setTemplateId('123456789123456789')
      .catch((err) => {
        assert.equal(err.response.status, 404);
      });
  });
});

describe('Test SendGrid', async () => {
  test('Set TemplateId', async () => {
    const email = new Email();
    await email.setTemplateId(process.env.TEMPLATE_ID_ORDERS)
      .then((data) => {
        assert.equal(data.templateId, process.env.TEMPLATE_ID_ORDERS);
      });
  });

  // test('Set TemplateId', async () => {
  //   const email = new Email();
  //   console.log('>> ', email.templateId);
  // });
});
