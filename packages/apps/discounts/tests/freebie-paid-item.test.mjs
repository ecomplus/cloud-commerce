import assert from 'node:assert';
import test, { describe } from 'node:test';
import applyDiscount from '../lib-mjs/apply-discount.mjs';

/*
Quando o brinde é um produto que a loja também vende (ex.: uma lata de granola),
o app tomava uma unidade paga do carrinho como se fosse o brinde e descontava o
preço dela do subtotal antes de comparar com o mínimo da regra. Com 4 latas
(R$ 251,60) e brinde a partir de R$ 249 o cliente não ganhava a lata, só a
partir de 5. A loja e o checkout marcam os itens de brinde com a flag
`freebie`, então só esses contam como brinde.
*/
const lataId = '6197a6130c7c7272258bdf8f';
const imaId = '6a4b9b46c115ac0e64b6ff8c';
const outroId = '000000000000000000000001';

const lata = (quantity, flags) => ({
  product_id: lataId,
  sku: 'PA744',
  name: 'Granola Lata 500g',
  quantity,
  price: 62.9,
  ...(flags && { flags }),
});
const ima = {
  product_id: imaId,
  sku: 'RV0114',
  name: 'Mini Azulejo Imã',
  quantity: 1,
  price: 9.9,
  flags: ['freebie', '__tmp'],
};
const outro = (price) => ({
  product_id: outroId,
  sku: 'OUTRO',
  name: 'Outro produto',
  quantity: 1,
  price,
});

const getApplication = () => ({
  data: {
    freebies_rules: [{
      label: 'lata e imã',
      product_ids: [lataId, imaId],
      min_subtotal: 248.99,
      cumulative_freebie: false,
      deduct_discounts: false,
    }, {
      label: 'imã',
      product_ids: [imaId],
      min_subtotal: 199,
      cumulative_freebie: true,
      deduct_discounts: false,
    }],
  },
  hidden_data: {},
});

const run = (items) => {
  const subtotal = Math.round(items.reduce((sum, { price, quantity }) => {
    return sum + price * quantity;
  }, 0) * 100) / 100;
  return applyDiscount({
    params: {
      lang: 'pt_br',
      currency_id: 'BRL',
      amount: { subtotal, total: subtotal, discount: 0 },
      items,
    },
    application: getApplication(),
  });
};

describe('Brinde que também é vendido pela loja', () => {
  test('4 latas pagas liberam a lata de brinde', async () => {
    const response = await run([lata(4), ima]);
    assert.deepStrictEqual(response.freebie_product_ids, [lataId, imaId]);
  });

  test('com a lata de brinde no carrinho, desconta só a unidade marcada', async () => {
    const response = await run([lata(4), lata(1, ['freebie', '__tmp']), ima]);
    assert.deepStrictEqual(response.freebie_product_ids, [lataId, imaId]);
    assert.strictEqual(response.discount_rule.label, 'lata e imã');
    assert.strictEqual(response.discount_rule.extra_discount.value, 72.8);
  });

  test('3 latas pagas não chegam ao mínimo e a lata de brinde sai', async () => {
    const response = await run([lata(3), lata(1, ['freebie', '__tmp']), ima]);
    assert.deepStrictEqual(response.freebie_product_ids, [imaId]);
    assert.strictEqual(response.discount_rule.extra_discount.value, 9.9);
  });

  test('carrinho sem nenhuma flag mantém a busca antiga pelo produto', async () => {
    const response = await run([outro(320), lata(1)]);
    assert.deepStrictEqual(response.freebie_product_ids, [lataId, imaId]);
    assert.strictEqual(response.discount_rule.extra_discount.value, 62.9);
  });
});
