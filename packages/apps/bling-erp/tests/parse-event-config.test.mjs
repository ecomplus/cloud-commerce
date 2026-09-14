import assert from 'node:assert';
import test, { describe } from 'node:test';
import parseEventConfig from '../lib/integration/helpers/parse-event-config.js';

/*
R3 — este é o único ponto de decisão do fan-out de eventos e já quebrou duas
vezes sem teste: a supressão na origem (X-Event-Flag) escondia os eventos dos
demais apps, e o filtro por authentication_id (credencial única do deploy)
descartava os eventos dos apps de pagamento e matava a exportação automática.
A matriz abaixo fixa o contrato: todo evento assinado É processado — o eco de
importação é aceito e tratado na exportação, nunca por autoria.
*/
describe('Parse store event to Bling integration queue', () => {
  test('mudança de status de pedido sempre exporta, seja qual for a autoria', () => {
    // O caminho principal: app de pagamento grava payments_history -> evento
    const config = parseEventConfig('orders-anyStatusSet', {}, 'a1b2c3d4e5f6a7b8c9d0e1f2');
    assert.deepStrictEqual(config?.integrationConfig, {
      _exportation: { order_ids: ['a1b2c3d4e5f6a7b8c9d0e1f2'] },
    });
    assert.strictEqual(config.canCreateNew, false);
    assert.strictEqual(config.isQueued, false);
  });

  test('`new_orders` libera criar o pedido só se nunca exportado (tri-state)', () => {
    const config = parseEventConfig('orders-anyStatusSet', { new_orders: true }, 'a1b2c3d4e5f6a7b8c9d0e1f2');
    assert.strictEqual(config?.canCreateNew, undefined);
  });

  test('evento de quantidade exige `export_quantity` e é só-estoque', () => {
    assert.strictEqual(parseEventConfig('products-quantitySet', {}, 'f1e2d3c4b5a6978869504132'), null);
    const config = parseEventConfig(
      'products-quantitySet',
      { export_quantity: true },
      'f1e2d3c4b5a6978869504132',
    );
    assert.deepStrictEqual(config?.integrationConfig, {
      _exportation: { product_ids: ['f1e2d3c4b5a6978869504132'] },
    });
    // Não reexporta o documento do produto (não sobrescreve edições no Bling)
    assert.strictEqual(config.isStockOnlyEvent, true);
    assert.strictEqual(config.canCreateNew, false);
  });

  test('evento de preço exige `export_price` e NÃO é só-estoque', () => {
    assert.strictEqual(parseEventConfig('products-priceSet', {}, 'f1e2d3c4b5a6978869504132'), null);
    const config = parseEventConfig(
      'products-priceSet',
      { export_price: true },
      'f1e2d3c4b5a6978869504132',
    );
    assert.strictEqual(config?.isStockOnlyEvent, false);
    assert.strictEqual(config.canCreateNew, false);
  });

  test('produto novo exige `new_products` e pode criar no Bling', () => {
    assert.strictEqual(parseEventConfig('products-new', {}, 'f1e2d3c4b5a6978869504132'), null);
    const config = parseEventConfig(
      'products-new',
      { new_products: true },
      'f1e2d3c4b5a6978869504132',
    );
    assert.strictEqual(config?.canCreateNew, true);
    assert.strictEqual(config.isStockOnlyEvent, false);
  });

  test('fila manual (applications-dataSet) processa o appData como fila', () => {
    const appData = {
      importation: { skus: ['SKU-1'] },
    };
    const config = parseEventConfig('applications-dataSet', appData, '112233445566778899aabbcc');
    assert.strictEqual(config?.integrationConfig, appData);
    assert.strictEqual(config.isQueued, true);
    assert.strictEqual(config.canCreateNew, true);
    assert.strictEqual(config.isStockOnlyEvent, false);
  });
});
