import assert from 'node:assert';
import test, { describe } from 'node:test';
import parseStatusFromBling from '../lib/integration/parsers/status-from-bling.js';
import parseOrderFromBling from '../lib/integration/parsers/order-from-bling.js';
import parseProductFromBling from '../lib/integration/parsers/product-from-bling.js';
import { blingProduct, blingOrderWithInvoice, order } from './payloads.mjs';

const appData = {};

describe('Parse Bling status to store', async () => {
  test('Financial statuses', () => {
    assert.deepStrictEqual(parseStatusFromBling('Aprovado', appData), {
      financialStatus: 'paid',
      fulfillmentStatus: undefined,
    });
    assert.deepStrictEqual(parseStatusFromBling('Cancelado', appData), {
      financialStatus: 'voided',
      fulfillmentStatus: undefined,
    });
    assert.deepStrictEqual(parseStatusFromBling('Devolvido', appData), {
      financialStatus: 'refunded',
      fulfillmentStatus: undefined,
    });
  });

  test('Fulfillment statuses', () => {
    assert.deepStrictEqual(parseStatusFromBling('Em separação', appData), {
      financialStatus: undefined,
      fulfillmentStatus: 'in_separation',
    });
    assert.deepStrictEqual(parseStatusFromBling('Atendido', appData), {
      financialStatus: undefined,
      fulfillmentStatus: 'invoice_issued',
    });
  });

  test('Unknown status maps to nothing', () => {
    assert.deepStrictEqual(parseStatusFromBling('Situação inexistente', appData), {
      financialStatus: undefined,
      fulfillmentStatus: undefined,
    });
  });

  test('Custom `parse_status` mapping wins', () => {
    const parsed = parseStatusFromBling('Aguardando Coleta', {
      parse_status: [{
        status_ecom: 'Pronto para envio',
        status_bling: 'Aguardando Coleta',
      }],
    });
    assert.strictEqual(parsed.fulfillmentStatus, 'ready_for_shipping');
  });
});

describe('Parse Bling order to store', async () => {
  test('Tracking code, invoice and staff notes', async () => {
    const shippingLines = JSON.parse(JSON.stringify(order.shipping_lines));
    const partialOrder = parseOrderFromBling(blingOrderWithInvoice, shippingLines);
    assert.strictEqual(partialOrder.staff_notes, 'Separado pela equipe A');
    const [shippingLine] = partialOrder.shipping_lines;
    assert.deepStrictEqual(shippingLine.tracking_codes, [{
      code: 'AA123456789BR',
      link: 'https://rastreio.test/AA123456789BR',
    }]);
    assert.strictEqual(shippingLine.invoices.length, 1);
    assert.strictEqual(shippingLine.invoices[0].number, '00123');
    assert.strictEqual(shippingLine.invoices[0].serial_number, '1');
    assert.strictEqual(
      shippingLine.invoices[0].access_key,
      '35260712345678000199550010000001231000001234',
    );
  });

  test('Keep manually set tracking code', async () => {
    const shippingLines = JSON.parse(JSON.stringify(order.shipping_lines));
    shippingLines[0].tracking_codes = [{
      code: 'MANUAL123',
      link: 'https://rastreio.test/MANUAL123',
    }];
    const partialOrder = parseOrderFromBling(blingOrderWithInvoice, shippingLines);
    assert.strictEqual(shippingLines[0].tracking_codes[0].code, 'MANUAL123');
    assert.strictEqual(partialOrder.staff_notes, 'Separado pela equipe A');
  });

  test('Order without shipping lines', async () => {
    const partialOrder = parseOrderFromBling(blingOrderWithInvoice, []);
    assert.deepStrictEqual(Object.keys(partialOrder), ['staff_notes']);
  });
});

describe('Parse Bling product to store', async () => {
  test('Base fields with promotional price', async () => {
    const parsed = await parseProductFromBling(
      JSON.parse(JSON.stringify(blingProduct)),
      undefined,
      true,
      appData,
    );
    assert.strictEqual(parsed.sku, 'CAM-BASICA');
    assert.strictEqual(parsed.name, 'Camiseta Básica');
    assert.strictEqual(parsed.available, true);
    assert.strictEqual(parsed.price, 79.9);
    assert.strictEqual(parsed.base_price, 89.9);
    assert.strictEqual(parsed.slug, 'camiseta-basica');
    assert.strictEqual(parsed.body_html, '<p>Camiseta de algodão</p>');
    assert.deepStrictEqual(parsed.mpn, ['61091000']);
    assert.deepStrictEqual(parsed.gtin, ['07891234567895']);
    assert.deepStrictEqual(parsed.weight, { unit: 'kg', value: 0.3 });
    assert.deepStrictEqual(parsed.dimensions.width, { unit: 'cm', value: 30 });
  });

  test('Variations with specifications and quantities', async () => {
    const parsed = await parseProductFromBling(
      JSON.parse(JSON.stringify(blingProduct)),
      undefined,
      true,
      appData,
    );
    assert.strictEqual(parsed.variations.length, 2);
    const [first, second] = parsed.variations;
    assert.strictEqual(first.sku, 'CAM-BASICA-P');
    assert.strictEqual(first.name, 'Camiseta Básica / P / Azul');
    assert.strictEqual(first.quantity, 5);
    // Known Bling labels map back to the store first-class grids
    assert.deepStrictEqual(first.specifications.size, [{ text: 'P', value: 'p' }]);
    assert.deepStrictEqual(first.specifications.colors, [{ text: 'Azul', value: '#0000ff' }]);
    assert.strictEqual(first.gtin, '07891234567895');
    assert.strictEqual(first.mpn, '61091000');
    assert.strictEqual(second.price, 94.9);
  });

  test('Grid labels map to store grids, unknown ones keep a slug', async () => {
    const blingProductWithGrids = JSON.parse(JSON.stringify(blingProduct));
    blingProductWithGrids.variacoes = [{
      id: 1,
      nome: 'Variação',
      codigo: 'SKU-1',
      preco: 89.9,
      estoqueAtual: 1,
      variacao: { nome: 'Idade:Adulto;Gênero:Feminino;Sabor:Morango' },
    }];
    const parsed = await parseProductFromBling(blingProductWithGrids, undefined, true, appData);
    const [variation] = parsed.variations;
    assert.deepStrictEqual(Object.keys(variation.specifications), [
      'age_group',
      'gender',
      'sabor',
    ]);
    assert.deepStrictEqual(variation.specifications.age_group, [
      { text: 'Adulto', value: 'adulto' },
    ]);
  });

  test('Variation without SKU on Bling falls back to its ID', async () => {
    const blingProductNoSku = JSON.parse(JSON.stringify(blingProduct));
    blingProductNoSku.variacoes = [{
      id: 16686983749,
      nome: 'Saia jeans tamanho:p',
      codigo: '',
      preco: 100,
      estoqueAtual: 4,
      variacao: { nome: 'tamanho:p' },
    }];
    const parsed = await parseProductFromBling(blingProductNoSku, undefined, true, appData);
    const [variation] = parsed.variations;
    assert.strictEqual(variation.sku, '16686983749');
    assert.strictEqual(variation.quantity, 4);
    assert.deepStrictEqual(variation.specifications.size, [{ text: 'p', value: 'p' }]);
  });

  test('Keep existing variation IDs', async () => {
    const variations = [{
      _id: '9e2b3c4d5f6a7b8c9d0e1f2a',
      sku: 'CAM-BASICA-P',
      name: 'Nome antigo',
      quantity: 0,
    }];
    const parsed = await parseProductFromBling(
      JSON.parse(JSON.stringify(blingProduct)),
      variations,
      false,
      appData,
    );
    const kept = parsed.variations.find(({ sku }) => sku === 'CAM-BASICA-P');
    assert.strictEqual(kept._id, '9e2b3c4d5f6a7b8c9d0e1f2a');
    assert.strictEqual(kept.quantity, 5);
    assert.strictEqual(parsed.slug, undefined);
  });

  /* C1 — sem saldo do Bling a quantidade tem que ficar de fora do body: o
  `GET /produtos/{id}` não traz estoque nas variações e o `/estoques/saldos` é
  tolerado com `catch`, então gravar 0 zerava o estoque da loja inteira. */
  test('Sem saldo do Bling a quantidade não é enviada', async () => {
    const blingProductNoStock = JSON.parse(JSON.stringify(blingProduct));
    delete blingProductNoStock.estoqueAtual;
    blingProductNoStock.variacoes.forEach((variacao) => {
      delete variacao.estoqueAtual;
    });
    const parsed = await parseProductFromBling(
      blingProductNoStock,
      [{ _id: '9e2b3c4d5f6a7b8c9d0e1f2a', sku: 'CAM-BASICA-P', quantity: 5 }],
      false,
      appData,
    );
    assert.strictEqual(parsed.quantity, undefined);
    // Variação que já existe na loja mantém o estoque atual, não é zerada
    const kept = parsed.variations.find(({ sku }) => sku === 'CAM-BASICA-P');
    assert.strictEqual(kept.quantity, 5);
    const created = parsed.variations.find(({ sku }) => sku === 'CAM-BASICA-M');
    assert.strictEqual(created.quantity, undefined);
  });

  test('Produto novo sem saldo nasce zerado', async () => {
    const blingProductNoStock = JSON.parse(JSON.stringify(blingProduct));
    delete blingProductNoStock.variacoes;
    const parsed = await parseProductFromBling(blingProductNoStock, undefined, true, appData);
    assert.strictEqual(parsed.quantity, 0);
  });

  test('Saldo do Bling é gravado, negativo vira zero', async () => {
    const blingProductStock = JSON.parse(JSON.stringify(blingProduct));
    blingProductStock.estoqueAtual = 12;
    blingProductStock.variacoes[0].estoqueAtual = -3;
    const parsed = await parseProductFromBling(blingProductStock, undefined, false, appData);
    assert.strictEqual(parsed.quantity, 12);
    assert.strictEqual(parsed.variations[0].quantity, 0);
  });

  test('Description is skipped with `non_update_description`', async () => {
    const parsed = await parseProductFromBling(
      JSON.parse(JSON.stringify(blingProduct)),
      undefined,
      false,
      { non_update_description: true },
    );
    assert.strictEqual(parsed.body_html, undefined);
  });

  test('Invalid GTIN is ignored', async () => {
    const parsed = await parseProductFromBling({
      ...JSON.parse(JSON.stringify(blingProduct)),
      gtin: '123',
    }, undefined, false, appData);
    assert.strictEqual(parsed.gtin, undefined);
  });
});
