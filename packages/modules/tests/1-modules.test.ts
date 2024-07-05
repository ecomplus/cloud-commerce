import { describe, test, expect } from 'vitest';
import { modulesUrl } from '@cloudcommerce/test-base';

describe('Test Schemas', async () => {
  test('@checkout', async () => {
    const req = await fetch(`${modulesUrl}/@checkout/schema`);
    expect(req.status).toBe(200);
  });
  test('apply_discount', async () => {
    const req = await fetch(`${modulesUrl}/apply_discount/schema`);
    expect(req.status).toBe(200);
  });
  test('calculate_shipping', async () => {
    const req = await fetch(`${modulesUrl}/calculate_shipping/schema`);
    expect(req.status).toBe(200);
  });
  test('create_transaction', async () => {
    const req = await fetch(`${modulesUrl}/create_transaction/schema`);
    expect(req.status).toBe(200);
  });
  test('list_payments', async () => {
    const req = await fetch(`${modulesUrl}/list_payments/schema`);
    expect(req.status).toBe(200);
  });
});
