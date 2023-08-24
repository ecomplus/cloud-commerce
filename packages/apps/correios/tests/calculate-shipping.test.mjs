/* eslint-disable import/no-extraneous-dependencies */
import assert from 'node:assert';
import test, { before, describe } from 'node:test';
import {
  modulesUrl,
  bodyCalculateShipping,
} from '@cloudcommerce/test-base';

describe('Test Shipping Calculation in the Correios App', async () => {
  let req;
  let data;
  const appId = 1248;

  before(async () => {
    req = await fetch(`${modulesUrl}/calculate_shipping?app_id=${appId}`, {
      method: 'POST',
      body: JSON.stringify(bodyCalculateShipping),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    data = (await req.json()).result;
    console.log('>> ', req, ' ', data);
  });

  test('Check Status 200', async () => {
    assert.strictEqual(req?.status, 200);
  });

  test('Check validated is true', async () => {
    assert.equal(data[0].validated, true);
  });

  test('Have shipping services', async () => {
    assert.equal(data[0].response.shipping_services.length > 0, true);
  });

  test('Has PAC shipping services', async () => {
    assert.equal((data[0].response.shipping_services.find((service) => service.label === 'PAC')).label, 'PAC');
  });

  test('Has SEDEX shipping services', async () => {
    assert.equal((data[0].response.shipping_services.find((service) => service.label === 'SEDEX')).label, 'SEDEX');
  });
});
