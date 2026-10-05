import assert from 'node:assert';
import test, { describe } from 'node:test';
import {
  get3dsOptions,
  parse3dsResult,
  to3dsCustomFields,
  REFUSAL_MESSAGE,
} from '../lib-mjs/lib/braspag/3ds/policy.mjs';
import parseToTransaction from '../lib-mjs/lib/braspag/payload-to-transaction.mjs';

const authenticated = {
  Cavv: 'AAABBBCCC=', Xid: 'xid', Eci: '05', Version: '2.2.0', ReferenceId: 'ref-1',
};

const params = (hashData) => ({
  amount: { total: 2999 },
  buyer: {
    fullname: 'Fulano de Tal', doc_number: '12345678909', registry_type: 'p', email: 'f@example.com',
  },
  to: {
    street: 'Av. Anhanguera',
    number: 7096,
    borough: 'Setor dos Funcionários',
    city: 'Goiânia',
    province_code: 'GO',
    zip: '74543010',
  },
  items: [{
    product_id: 'p1', sku: '868', name: 'Split', quantity: 1, price: 2999,
  }],
  installments_number: 1,
  credit_card: { hash: Buffer.from(JSON.stringify({ token: 'tok', fingerPrintId: 'fp', ...hashData })).toString('base64') },
});

const appData = (braspag3ds) => ({
  credit_card: { provider: 'Cielo30' },
  braspag_3ds: braspag3ds,
});

describe('3DS policy', () => {
  test('accepts authenticated and attempted ECI of each brand', () => {
    ['05', '06', '02', '01', 5].forEach((Eci) => {
      assert.strictEqual(parse3dsResult({ ...authenticated, Eci }).isAuthenticated, true, `ECI ${Eci}`);
    });
  });

  test('refuses non authenticated ECI and missing CAVV or ReferenceId', () => {
    assert.strictEqual(parse3dsResult({ ...authenticated, Eci: '07' }).isAuthenticated, false);
    assert.strictEqual(parse3dsResult({ ...authenticated, Eci: '00' }).isAuthenticated, false);
    assert.strictEqual(parse3dsResult({ ...authenticated, Cavv: '' }).isAuthenticated, false);
    const noReference = { ...authenticated, ReferenceId: null };
    assert.strictEqual(parse3dsResult(noReference).isAuthenticated, false);
    assert.strictEqual(parse3dsResult(undefined, 'timeout').status, 'timeout');
  });

  test('timeout is configurable, bigger when 3DS is required, within 30 s and 15 min', () => {
    assert.strictEqual(get3dsOptions(appData({ required: true })).timeoutMs, 300000);
    assert.strictEqual(get3dsOptions(appData({})).timeoutMs, 30000);
    assert.strictEqual(get3dsOptions(appData({ timeout: 600 })).timeoutMs, 600000);
    assert.strictEqual(get3dsOptions(appData({ timeout: 5 })).timeoutMs, 30000);
    assert.strictEqual(get3dsOptions(appData({ timeout: 99999 })).timeoutMs, 900000);
  });

  test('custom fields show the result on the order', () => {
    assert.deepStrictEqual(to3dsCustomFields(parse3dsResult(authenticated, 'authenticated')), [
      { field: '3ds', value: 'autenticado' },
      { field: '3ds_eci', value: '05' },
      { field: '3ds_versao', value: '2.2.0' },
      { field: '3ds_referencia', value: 'ref-1' },
    ]);
    assert.deepStrictEqual(to3dsCustomFields(parse3dsResult(undefined, 'failure')), [
      { field: '3ds', value: 'não autenticado (desafio não concluído)' },
    ]);
  });
});

describe('Card transaction with 3DS', () => {
  test('required 3DS refuses before calling Cielo when not authenticated', () => {
    ['failure', 'unenrolled', 'unsupported_brand', 'timeout', 'script_error', undefined].forEach((status3ds) => {
      assert.throws(
        () => parseToTransaction(appData({ required: true }), 'o1', params({ status3ds }), 'credit_card'),
        (err) => err.name === 'Required3dsError' && err.message === REFUSAL_MESSAGE,
        `status ${status3ds}`,
      );
    });
  });

  test('authenticated card goes with external authentication and capture', () => {
    const body = parseToTransaction(
      appData({ required: true }),
      'o1',
      params({ out3ds: { ...authenticated, Extra: 'x' }, status3ds: 'authenticated' }),
      'credit_card',
    );
    assert.strictEqual(body.Payment.Authenticate, true);
    assert.deepStrictEqual(body.Payment.ExternalAuthentication, {
      Cavv: 'AAABBBCCC=', Xid: 'xid', Eci: '05', Version: '2.2.0', ReferenceId: 'ref-1',
    });
    assert.strictEqual(body.Payment.Capture, true);
    assert.strictEqual(body.Payment.FraudAnalysis, undefined);
  });

  test('fraud analysis can be kept on authenticated cards', () => {
    const body = parseToTransaction(
      appData({ required: true, fraud_analysis: true }),
      'o1',
      params({ out3ds: authenticated, status3ds: 'authenticated' }),
      'credit_card',
    );
    assert.strictEqual(body.Payment.Authenticate, true);
    assert.ok(body.Payment.FraudAnalysis);
  });

  test('optional 3DS keeps legacy behavior: unauthenticated goes with fraud analysis', () => {
    const body = parseToTransaction(appData({}), 'o1', params({ status3ds: 'failure' }), 'credit_card');
    assert.strictEqual(body.Payment.Authenticate, undefined);
    assert.ok(body.Payment.FraudAnalysis);
  });
});
