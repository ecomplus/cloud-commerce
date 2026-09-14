import assert from 'node:assert';
import test, { describe } from 'node:test';
import parseStockFromDeposits, { hasDepositBalance } from '../lib/integration/helpers/parse-stock-from-deposits.js';

// C6 — import e export precisam usar EXATAMENTE a mesma base de estoque.
// Com reserva: saldoVirtual; sem reserva: saldo/saldoFisico; filtra pelo
// depósito configurado ou soma todos.
describe('parseStockFromDeposits as the single stock base for import/export', () => {
  const item = {
    depositos: [
      { id: 10, saldoFisico: 12, saldoVirtual: 8 },
      { id: 20, saldoFisico: 5, saldoVirtual: 5 },
    ],
  };

  test('sem reserva usa o saldo físico do depósito configurado', () => {
    assert.strictEqual(parseStockFromDeposits(item, 10, false), 12);
    assert.strictEqual(parseStockFromDeposits(item, 20, false), 5);
  });

  test('com reserva usa o saldo virtual do depósito configurado', () => {
    assert.strictEqual(parseStockFromDeposits(item, 10, true), 8);
  });

  test('sem depósito configurado soma TODOS os depósitos', () => {
    assert.strictEqual(parseStockFromDeposits(item, undefined, false), 17); // 12 + 5
    assert.strictEqual(parseStockFromDeposits(item, undefined, true), 13); // 8 + 5
  });

  test('prefere `saldo` numérico a `saldoFisico`', () => {
    const blingItem = { depositos: [{ id: 10, saldo: 7, saldoFisico: 12 }] };
    assert.strictEqual(parseStockFromDeposits(blingItem, 10, false), 7);
  });

  test('casa id como string ou número', () => {
    assert.strictEqual(parseStockFromDeposits(item, '10', false), 12);
  });

  test('sem depositos válidos devolve 0', () => {
    assert.strictEqual(parseStockFromDeposits({}, 10, false), 0);
    assert.strictEqual(parseStockFromDeposits(undefined, 10, false), 0);
  });
});

// Review 19/08 — `bling_deposit` configurado mas ausente na resposta do Bling
// não pode somar todos em silêncio: é a mesma divergência que o campo existe
// para eliminar, e um id digitado errado seria indistinguível de um correto.
describe('configured bling_deposit missing from Bling response', () => {
  const item = {
    codigo: 'SKU-1',
    depositos: [
      { id: 10, saldoFisico: 12, saldoVirtual: 8 },
      { id: 20, saldoFisico: 5, saldoVirtual: 5 },
    ],
  };

  test('lança erro de configuração visível em vez de somar tudo', () => {
    assert.throws(
      () => parseStockFromDeposits(item, 30, false),
      (err) => err.isConfigError === true && /dep[óo]sito 30/i.test(err.message),
    );
  });

  test('sem `depositos` na resposta segue devolvendo 0, sem erro', () => {
    assert.strictEqual(parseStockFromDeposits({ depositos: [] }, 30, false), 0);
    assert.strictEqual(parseStockFromDeposits({}, 30, false), 0);
  });
});

// Review 19/08 — a guarda de exportação só deve travar com 2+ depósitos COM
// saldo: conta com "Geral" + um segundo depósito vazio (devolução/avaria) não
// pode deixar o produto com estoque 0 para sempre no Bling.
describe('hasDepositBalance for the multi-deposit export guard', () => {
  test('depósito zerado em todas as bases não conta', () => {
    assert.strictEqual(hasDepositBalance({ id: 20, saldoFisico: 0, saldoVirtual: 0 }), false);
    assert.strictEqual(hasDepositBalance({ id: 20 }), false);
  });

  test('saldo físico, `saldo` ou virtual não nulos contam', () => {
    assert.strictEqual(hasDepositBalance({ saldoFisico: 3 }), true);
    assert.strictEqual(hasDepositBalance({ saldo: 2, saldoFisico: 0 }), true);
    assert.strictEqual(hasDepositBalance({ saldoFisico: 0, saldoVirtual: 1 }), true);
    // Saldo negativo (venda sem estoque) ainda é saldo a corrigir
    assert.strictEqual(hasDepositBalance({ saldoFisico: -2 }), true);
  });
});
