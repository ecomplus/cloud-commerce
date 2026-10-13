import assert from 'node:assert';
import test, { describe } from 'node:test';
import { parseAddress } from '../lib-mjs/lib/braspag/parse-utils.mjs';
import parseToTransaction from '../lib-mjs/lib/braspag/payload-to-transaction.mjs';

const address = {
  street: 'Av. Anhanguera',
  number: 7096,
  borough: 'Setor dos Funcionários',
  city: 'Goiânia',
  province_code: 'GO',
  zip: '74543-010',
};

describe('Customer address sent to Braspag', () => {
  test('saved address with country code, restored by checkout on masked addresses', () => {
    assert.strictEqual(parseAddress({ ...address, country_code: 'BR' }).Country, 'BRA');
    assert.strictEqual(parseAddress({ ...address, country_code: 'br' }).Country, 'BRA');
    assert.strictEqual(parseAddress(address).Country, 'BRA');
  });

  test('address without number', () => {
    assert.strictEqual(parseAddress({ ...address, number: undefined }).Number, 's/n');
    assert.strictEqual(parseAddress(address).Number, '7096');
  });

  test('billet for a customer paying with a saved address', () => {
    const body = parseToTransaction({ banking_billet: { provider: 'Simulado' } }, 'order-1', {
      amount: { total: 2999 },
      buyer: { fullname: 'Fulano de Tal', doc_number: '12345678909', registry_type: 'p' },
      to: { ...address, country_code: 'BR' },
      items: [],
    }, 'banking_billet');
    assert.strictEqual(body.Customer.Address.Country, 'BRA');
    assert.strictEqual(body.Payment.Type, 'Boleto');
  });
});
