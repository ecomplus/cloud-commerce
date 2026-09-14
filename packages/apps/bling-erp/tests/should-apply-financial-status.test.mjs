import assert from 'node:assert';
import test, { describe } from 'node:test';
import shouldApply from '../lib/integration/helpers/should-apply-financial-status.js';

// R4 — contrapartida do guard de fulfillment. "Cancelado" no Bling é o alvo de
// cinco status financeiros da loja e volta sempre como `voided`: sem o corte, o
// pedido estornado que o app exportou volta pelo callback como cancelado.
describe('Guard against financial status downgrade on import', () => {
  test('não regrava refunded como voided (eco da própria exportação)', () => {
    assert.strictEqual(shouldApply('refunded', 'voided'), false);
  });

  test('não regrava partially_refunded como voided', () => {
    assert.strictEqual(shouldApply('partially_refunded', 'voided'), false);
  });

  test('cancelamento de pedido pago no Bling continua propagando', () => {
    assert.strictEqual(shouldApply('paid', 'voided'), true);
  });

  test('cancelamento de pedido em disputa ou não autorizado continua propagando', () => {
    assert.strictEqual(shouldApply('in_dispute', 'voided'), true);
    assert.strictEqual(shouldApply('unauthorized', 'voided'), true);
  });

  test('estorno vindo do Bling é aplicado sobre pedido pago', () => {
    assert.strictEqual(shouldApply('paid', 'refunded'), true);
  });

  test('aplica quando não há status atual', () => {
    assert.strictEqual(shouldApply(undefined, 'voided'), true);
  });

  test('sem próximo status não aplica', () => {
    assert.strictEqual(shouldApply('refunded', undefined), false);
  });
});
