import assert from 'node:assert';
import test, { describe } from 'node:test';
import shouldAdvance from '../lib/integration/helpers/should-advance-fulfillment.js';

// C5 — o import não pode regredir o fulfillment. Numa conta Bling padrão,
// "enviado"/"entregue" colapsam em "Atendido", que volta como invoice_issued.
describe('Guard against fulfillment status regression on import', () => {
  test('não regride delivered para invoice_issued', () => {
    assert.strictEqual(shouldAdvance('delivered', 'invoice_issued'), false);
  });

  test('não regride shipped para invoice_issued', () => {
    assert.strictEqual(shouldAdvance('shipped', 'invoice_issued'), false);
  });

  test('não regride shipped para in_separation', () => {
    assert.strictEqual(shouldAdvance('shipped', 'in_separation'), false);
  });

  test('avança invoice_issued para delivered', () => {
    assert.strictEqual(shouldAdvance('invoice_issued', 'delivered'), true);
  });

  test('aplica quando não há status atual', () => {
    assert.strictEqual(shouldAdvance(undefined, 'shipped'), true);
  });

  test('mesmo status na esteira é aplicado (idempotente)', () => {
    assert.strictEqual(shouldAdvance('shipped', 'shipped'), true);
  });

  test('status fora da esteira (troca/devolução) é sempre aplicado', () => {
    assert.strictEqual(shouldAdvance('delivered', 'returned_for_exchange'), true);
    assert.strictEqual(shouldAdvance('delivered', 'received_for_exchange'), true);
  });

  test('sem próximo status não aplica', () => {
    assert.strictEqual(shouldAdvance('shipped', undefined), false);
  });
});
