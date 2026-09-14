import assert from 'node:assert';
import test, { describe } from 'node:test';
import parseOrder from '../lib/integration/parsers/order-to-bling.js';
import parseStatusToBling from '../lib/integration/parsers/status-to-bling.js';
import parseProduct from '../lib/integration/parsers/product-to-bling.js';
import parseAddress from '../lib/integration/parsers/address-to-bling.js';
import { order, product } from './payloads.mjs';

const appData = {};
const itemsBling = [{ id: 555, codigo: 'CAM-P-AZUL' }];

describe('Parse address to Bling', async () => {
  test('Format CEP and map fields', () => {
    const blingAddress = {};
    parseAddress(order.shipping_lines[0].to, blingAddress);
    assert.strictEqual(blingAddress.endereco, 'Rua das Flores');
    assert.strictEqual(blingAddress.numero, '100');
    assert.strictEqual(blingAddress.municipio, 'São Paulo');
    assert.strictEqual(blingAddress.uf, 'SP');
    assert.strictEqual(blingAddress.cep, '01.001-000');
  });

  test('Keep already set fields', () => {
    const blingAddress = { endereco: 'Rua Original' };
    parseAddress(order.shipping_lines[0].to, blingAddress);
    assert.strictEqual(blingAddress.endereco, 'Rua Original');
  });
});

describe('Parse order status to Bling', async () => {
  test('Paid and ready for shipping', () => {
    assert.deepStrictEqual(
      parseStatusToBling(order, appData),
      ['pronto para envio', 'pronto envio'],
    );
  });

  test('Pending payment takes precedence over fulfillment', () => {
    const statuses = parseStatusToBling({
      ...order,
      financial_status: { current: 'pending' },
    }, appData);
    assert.deepStrictEqual(statuses, ['pendente', 'em aberto']);
  });

  test('Voided order is cancelled', () => {
    const statuses = parseStatusToBling({
      ...order,
      financial_status: { current: 'voided' },
    }, appData);
    assert.deepStrictEqual(statuses, ['cancelado']);
  });

  test('Custom `parse_status` mapping wins', () => {
    const statuses = parseStatusToBling(order, {
      parse_status: [{
        status_ecom: 'Pronto para envio',
        status_bling: 'Aguardando Coleta',
      }],
    });
    assert.deepStrictEqual(statuses, ['aguardando coleta']);
  });

  test('Fallback to payments history when no financial status', () => {
    const statuses = parseStatusToBling({
      ...order,
      financial_status: undefined,
      fulfillment_status: undefined,
      payments_history: [{ status: 'paid' }],
    }, appData);
    assert.deepStrictEqual(statuses, ['aprovado', 'em aberto']);
  });
});

describe('Parse order to Bling', async () => {
  const blingOrder = parseOrder(order, '1042', undefined, appData, 42, 3, itemsBling);

  test('Base fields', () => {
    assert.strictEqual(blingOrder.numeroLoja, '1042');
    assert.strictEqual(blingOrder.numero, 1042);
    assert.strictEqual(blingOrder.data, '2026-07-30');
    assert.deepStrictEqual(blingOrder.contato, { id: 42 });
    assert.strictEqual(blingOrder.observacoes, 'Entregar no período da tarde');
  });

  test('Items with matched Bling product ID', () => {
    assert.strictEqual(blingOrder.itens.length, 1);
    const [item] = blingOrder.itens;
    assert.strictEqual(item.codigo, 'CAM-P-AZUL');
    assert.strictEqual(item.quantidade, 2);
    assert.strictEqual(item.valor, 110);
    assert.deepStrictEqual(item.produto, { id: 555 });
  });

  test('Freight, weight and shipping service', () => {
    assert.strictEqual(blingOrder.transporte.frete, 39.9);
    assert.strictEqual(blingOrder.transporte.pesoBruto, 0.8);
    assert.deepStrictEqual(blingOrder.transporte.volumes, [{ servico: 'PAC' }]);
    assert.strictEqual(blingOrder.transporte.etiqueta.cep, '01.001-000');
  });

  test('Estimated date skips weekends and holidays', () => {
    // 2026-07-30 (Thu) + 2 posting + 3 delivery working days => 2026-08-06 (Thu)
    assert.strictEqual(blingOrder.dataPrevista, '2026-08-06');
  });

  test('Discount', () => {
    assert.deepStrictEqual(blingOrder.desconto, { valor: 10, unidade: 'REAL' });
  });

  test('Installments split the total', () => {
    assert.strictEqual(blingOrder.parcelas.length, 2);
    const total = blingOrder.parcelas.reduce((acc, { valor }) => acc + valor, 0);
    // 220 (items) + 39.9 (freight) - 10 (discount)
    assert.strictEqual(Math.round(total * 100) / 100, 249.9);
    assert.deepStrictEqual(blingOrder.parcelas[0].formaPagamento, { id: 3 });
    assert.match(blingOrder.parcelas[0].observacoes, /\(1\/2\)$/);
  });

  test('Random order number when configured', () => {
    const randomized = parseOrder(order, '87654321', undefined, {
      random_order_number: true,
    }, 42, 3, itemsBling);
    assert.strictEqual(randomized.numero, 87654321);
    assert.strictEqual(randomized.numeroLoja, '1042');
  });

  /* C4 — quando o número da loja já existe no Bling, a exportação gera um
  aleatório; antes o parser ignorava esse valor e reenviava o número da loja,
  e o `POST` voltava rejeitado por número duplicado a cada mudança de status. */
  test('Número gerado por colisão de numeração é respeitado', () => {
    const collided = parseOrder(order, '87654321', undefined, {}, 42, 3, itemsBling);
    assert.strictEqual(collided.numero, 87654321);
    assert.strictEqual(collided.numeroLoja, '1042');
  });

  test('Disable order number when configured', () => {
    const noNumber = parseOrder(order, '1042', undefined, {
      disable_order_number: true,
    }, 42, 3, itemsBling);
    assert.strictEqual(noNumber.numero, undefined);
  });

  test('Bling store and predefined order data', () => {
    const withStore = parseOrder(order, '1042', 205000, {
      bling_order_data: { vendedor: { id: 77 }, outrasDespesas: 5 },
    }, 42, 3, itemsBling);
    assert.deepStrictEqual(withStore.loja, { id: 205000 });
    assert.deepStrictEqual(withStore.vendedor, { id: 77 });
    assert.strictEqual(withStore.outrasDespesas, 5);
  });

  test('Custom shipping mapping by app label', () => {
    const mapped = parseOrder(order, '1042', undefined, {
      parse_shipping: [{ ecom_shipping: 'correios', bling_shipping: 'SEDEX' }],
    }, 42, 3, itemsBling);
    assert.deepStrictEqual(mapped.transporte.volumes, [{ servico: 'SEDEX' }]);
  });
});

describe('Parse product to Bling', async () => {
  const blingProduct = parseProduct(product, undefined, appData);

  test('Base fields', () => {
    assert.strictEqual(blingProduct.nome, 'Camiseta Básica');
    assert.strictEqual(blingProduct.codigo, 'CAM-BASICA');
    assert.strictEqual(blingProduct.formato, 'V');
    assert.strictEqual(blingProduct.situacao, 'A');
    assert.strictEqual(blingProduct.preco, 89.9);
    assert.strictEqual(blingProduct.unidade, 'UN');
    assert.strictEqual(blingProduct.condicao, 1);
    assert.strictEqual(blingProduct.marca, 'Marca Teste');
  });

  test('Weight converted to kg and dimensions', () => {
    assert.strictEqual(blingProduct.pesoBruto, 0.3);
    assert.strictEqual(blingProduct.pesoLiquido, 0.3);
    assert.deepStrictEqual(blingProduct.dimensoes, {
      largura: 30,
      altura: 2,
      profundidade: 40,
      unidadeMedida: 1,
    });
  });

  test('Taxation, GTIN and pictures', () => {
    assert.deepStrictEqual(blingProduct.tributacao, { ncm: '61091000' });
    assert.strictEqual(blingProduct.gtin, '07891234567895');
    assert.deepStrictEqual(blingProduct.midia.imagens.imagensURL, [
      { link: 'https://cdn.test/camiseta-zoom.jpg' },
    ]);
  });

  test('Variations with grid names', () => {
    assert.strictEqual(blingProduct.variacoes.length, 2);
    const [first, second] = blingProduct.variacoes;
    assert.strictEqual(first.codigo, 'CAM-BASICA-P');
    assert.strictEqual(first.variacao.nome, 'Tamanho:P;Cor:Azul');
    assert.strictEqual(second.preco, 94.9);
    assert.strictEqual(second.variacao.nome, 'Tamanho:M;Cor:Azul');
  });

  test('Stock is only sent for new products or when exporting quantity', () => {
    assert.deepStrictEqual(blingProduct.variacoes[0].estoque, { maximo: 5 });
    const kept = parseProduct(product, {
      id: 1,
      estoque: { maximo: 99 },
      variacoes: [{ codigo: 'CAM-BASICA-P', estoque: { maximo: 42 } }],
    }, appData);
    assert.deepStrictEqual(kept.variacoes[0].estoque, { maximo: 42 });
    const exported = parseProduct(product, {
      id: 1,
      estoque: { maximo: 99 },
      variacoes: [{ codigo: 'CAM-BASICA-P', estoque: { maximo: 42 } }],
    }, { export_quantity: true });
    assert.deepStrictEqual(exported.variacoes[0].estoque, { maximo: 5 });
  });

  test('Simple product keeps `S` format', () => {
    const simple = parseProduct({ ...product, variations: undefined }, undefined, appData);
    assert.strictEqual(simple.formato, 'S');
    assert.deepStrictEqual(simple.estoque, { maximo: 12 });
    assert.strictEqual(simple.variacoes, undefined);
  });
});
