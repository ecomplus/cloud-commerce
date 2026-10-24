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
    const { body } = parseToTransaction({ banking_billet: { provider: 'Simulado' } }, 'order-1', {
      amount: { total: 2999 },
      buyer: { fullname: 'Fulano de Tal', doc_number: '12345678909', registry_type: 'p' },
      to: { ...address, country_code: 'BR' },
      items: [],
    }, 'banking_billet');
    assert.strictEqual(body.Customer.Address.Country, 'BRA');
    assert.strictEqual(body.Payment.Type, 'Boleto');
  });

  test('billing address restored by checkout when there is no shipping address', () => {
    const { body } = parseToTransaction({ banking_billet: { provider: 'Simulado' } }, 'order-1', {
      amount: { total: 2999 },
      buyer: { fullname: 'Fulano de Tal', doc_number: '12345678909', registry_type: 'p' },
      billing_address: { ...address, country_code: 'BR' },
      items: [],
    }, 'banking_billet');
    assert.strictEqual(body.Customer.Address.Country, 'BRA');
    assert.strictEqual(body.Customer.Address.ZipCode, '74543010');
  });
});

describe('Customer phone sent to Braspag', () => {
  const cardHash = Buffer.from(JSON.stringify({ token: 'tok', fingerPrintId: 'fp' }))
    .toString('base64');
  const payCard = (phone) => parseToTransaction({ credit_card: { provider: 'Simulado' } }, 'order-1', {
    amount: { total: 2999 },
    buyer: {
      fullname: 'Fulano de Tal', doc_number: '12345678909', registry_type: 'p', phone,
    },
    to: address,
    items: [],
    credit_card: { hash: cardHash },
  }, 'credit_card').body;

  test('saved phone with country code, restored by checkout on masked customers', () => {
    const body = payCard({ country_code: 55, number: '31999998888' });
    assert.strictEqual(body.Customer.Phone, '+55 31 99999-8888');
  });

  test('phone without country code', () => {
    const body = payCard({ number: '3133334444' });
    assert.strictEqual(body.Customer.Phone, '+55 31 3333-4444');
  });
});
