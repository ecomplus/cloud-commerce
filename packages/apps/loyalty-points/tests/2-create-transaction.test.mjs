/* eslint-disable import/no-extraneous-dependencies */
import assert from 'node:assert';
import test, { before, describe } from 'node:test';
import {
  modulesUrl,
  bodyCreateTransaction,
} from '@cloudcommerce/test-base';

describe('Test App Loyalty Points', async () => {
  let req;
  let data;
  const appId = 124890;
  before(async () => {
    const paymentMethodCreditCard = {
      code: 'loyalty_points',
      // name: 'Pix - Mercado Pago',
    };
    bodyCreateTransaction.payment_method = paymentMethodCreditCard;

    req = await fetch(`${modulesUrl}/create_transaction?app_id=${appId}`, {
      method: 'POST',
      body: JSON.stringify(bodyCreateTransaction),
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

  test('Have transaction', async () => {
    assert.notEqual(data[0].response.transaction, undefined);
  });
});
