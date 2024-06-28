import { describe, expect, it } from 'vitest';
import { modulesUrl } from '@cloudcommerce/test-base';

describe('Test API Modules Schemas', async () => {
  it('@checkout', async () => {
    const req = await fetch(`${modulesUrl}/@checkout/schema`);
    expect(req.status).toBe(200);
  });
  it('apply_discount', async () => {
    const req = await fetch(`${modulesUrl}/apply_discount/schema`);
    expect(req.status).toBe(200);
  });
  it('calculate_shipping', async () => {
    const req = await fetch(`${modulesUrl}/calculate_shipping/schema`);
    expect(req.status).toBe(200);
  });
  it('create_transaction', async () => {
    const req = await fetch(`${modulesUrl}/create_transaction/schema`);
    expect(req.status).toBe(200);
  });
  it('list_payments', async () => {
    const req = await fetch(`${modulesUrl}/list_payments/schema`);
    expect(req.status).toBe(200);
  });
});
