/* eslint-disable import/no-extraneous-dependencies */
import assert from 'node:assert';
import test, { before, describe } from 'node:test';
import {
  modulesUrl,
  bodyListPayments,
} from '@cloudcommerce/test-base';

describe('Test App Loyalty Points', async () => {
  let req;
  let data;
  const appId = 124890;

  before(async () => {
    req = await fetch(`${modulesUrl}/list_payments?app_id=${appId}`, {
      method: 'POST',
      body: JSON.stringify(bodyListPayments),
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

  test('Have payment gateways', async () => {
    assert.notEqual(data[0].response.payment_gateways.length, 0);
  });
});
