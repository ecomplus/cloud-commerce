/* eslint-disable import/no-relative-packages */
import assert from 'node:assert';
import test, { describe } from 'node:test';
import listPayments from '../lib/paghiper-list-payments.js';
import parseDueDate from '../lib/functions-lib/due-date.js';

process.env.PAGHIPER_API_KEY = process.env.PAGHIPER_API_KEY || 'apk_test';

const list = (data, total) => listPayments({
  application: { data, hidden_data: {} },
  params: { lang: 'pt_br', amount: { total } },
});
const codes = (res) => res.payment_gateways.map((g) => g.payment_method.code);

describe('PagHiper list payments', () => {
  test('lists banking billet by default (no Pix config)', async () => {
    assert.deepStrictEqual(codes(await list({}, 100)), ['banking_billet']);
  });

  test('lists billet and Pix when Pix is enabled', async () => {
    assert.deepStrictEqual(
      codes(await list({ pix: { enable: true } }, 100)),
      ['banking_billet', 'account_deposit'],
    );
  });

  test('hides banking billet only when disable_billet is set', async () => {
    assert.deepStrictEqual(
      codes(await list({ pix: { enable: true, disable_billet: true } }, 100)),
      ['account_deposit'],
    );
  });

  test('respects configured minimum amount for both methods', async () => {
    const config = { min_amount: 200, pix: { enable: true } };
    assert.deepStrictEqual(codes(await list(config, 150)), []);
    assert.deepStrictEqual(codes(await list(config, 250)), ['banking_billet', 'account_deposit']);
  });

  test('keeps R$ 3 floor for Pix without configured minimum', async () => {
    assert.deepStrictEqual(codes(await list({ pix: { enable: true } }, 2)), ['banking_billet']);
  });

  test('lists both on showcase requests without amount', async () => {
    assert.deepStrictEqual(
      codes(await list({ min_amount: 200, pix: { enable: true } })),
      ['banking_billet', 'account_deposit'],
    );
  });
});

describe('PagHiper due date', () => {
  test('date only means end of day in Brasília', () => {
    assert.strictEqual(parseDueDate('2026-10-08'), '2026-10-09T02:59:59.000Z');
  });

  test('date and time are Brasília time', () => {
    assert.strictEqual(parseDueDate('2026-10-08 15:30:00'), '2026-10-08T18:30:00.000Z');
  });

  test('keeps ISO with offset and ignores invalid', () => {
    assert.strictEqual(parseDueDate('2026-10-08T15:30:00Z'), '2026-10-08T15:30:00.000Z');
    assert.strictEqual(parseDueDate('amanhã'), undefined);
    assert.strictEqual(parseDueDate(undefined), undefined);
  });
});
