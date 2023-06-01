import assert from 'node:assert';
import test, { describe } from 'node:test';

const baseUrl = 'http://127.0.0.1:5001/ecom2-002/southamerica-east1/modules';

describe('Test Schemas', async () => {
  test('@checkout', async (/* t */) => {
    const req = await fetch(`${baseUrl}/@checkout/schema`);
    assert.strictEqual(req.status, 200);
  });
  test('apply_discount', async () => {
    const req = await fetch(`${baseUrl}/apply_discount/schema`);
    assert.strictEqual(req.status, 200);
  });
  test('calculate_shipping', async () => {
    const req = await fetch(`${baseUrl}/calculate_shipping/schema`);
    assert.strictEqual(req.status, 200);
  });
  test('create_transaction', async () => {
    const req = await fetch(`${baseUrl}/create_transaction/schema`);
    assert.strictEqual(req.status, 200);
  });
  test('list_payments', async () => {
    const req = await fetch(`${baseUrl}/list_payments/schema`);
    assert.strictEqual(req.status, 200);
  });
});
