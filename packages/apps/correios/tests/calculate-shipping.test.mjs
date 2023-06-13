import assert from 'node:assert';
import test, { before, describe } from 'node:test';

const projectId = process.env.PROJECTID || 'ecom-ecom2';
const baseUrl = `http://127.0.0.1:5001/${projectId}/southamerica-east1/modules`;

const payload = {
  to: { zip: '35701134' },
  items: [{
    product_id: '6166cb1528ace502aea2dc36',
    sku: 'GIE2742',
    name: 'Vaso para orquídeas',
    quantity: 1,
    currency_id: 'BRL',
    currency_symbol: 'R$',
    price: 24.99,
    dimensions: {
      width: { unit: 'cm', value: 30 },
      height: { unit: 'cm', value: 30 },
      length: { unit: 'cm', value: 30 },
    },
    weight: { unit: 'kg', value: 0.5 },
  }],
  subtotal: 24.99,
};

describe('Test App Correios', async () => {
  let req;
  let data;

  before(async () => {
    req = await fetch(`${baseUrl}/calculate_shipping?app_id=1248`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    data = (await req.json()).result;
  });

  test('Check Status 200', async () => {
    assert.strictEqual(req?.status, 200);
  });

  test('Check validated is true', async () => {
    assert.equal(data[0].validated, true);
  });

  test('Check error_message is NULL', async () => {
    assert.equal(data[0].error_message, null);
  });

  test('Have shipping services', async () => {
    assert.notEqual(data[0].response.shipping_services.length, 0);
  });
});
