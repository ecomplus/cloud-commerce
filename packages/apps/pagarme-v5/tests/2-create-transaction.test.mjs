/* eslint-disable import/no-extraneous-dependencies */
import assert from 'node:assert';
import test, { before, describe } from 'node:test';
import {
  modulesUrl,
  bodyCreateTransaction,
} from '@cloudcommerce/test-base';

describe('Test to create a transaction in the Pagar.me V5 with banking billet', async () => {
  let req;
  let data;
  const appId = 112381;
  before(async () => {
    const paymentMethod = {
      code: 'account_deposit',
      name: 'Pix - Pagar.me',
    };
    const to = {
      zip: '35701134',
      province_code: 'MG',
      name: 'Wisley Alves',
      city: 'Sete Lagoas',
      borough: 'Progresso',
      street: 'Rua Santo André',
      number: 81,
    };

    Object.assign(bodyCreateTransaction, {
      payment_method: paymentMethod,
      to,
      domain: 'www.lojatest.com.br',
    });

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
