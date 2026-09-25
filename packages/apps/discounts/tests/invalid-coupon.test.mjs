import assert from 'node:assert';
import test, { describe } from 'node:test';
import applyDiscount from '../lib-mjs/apply-discount.mjs';

/*
Com uma campanha de kit ativa (ex.: leve 4 pague 3) a resposta sempre traz
`discount_rule`, e o DiscountApplier da loja trata qualquer desconto com cupom
digitado como "Cupom de desconto aplicado com sucesso." a menos que o app
devolva `invalid_coupon_message`. O cupom inválido ainda era gravado no
carrinho como se tivesse sido aceito.
*/
const categoryId = '68371790f3c4f8399c4948c2';
const items = [70, 70, 60, 80].map((price, i) => ({
  product_id: `00000000000000000000000${i + 1}`,
  sku: `SKU-${i + 1}`,
  name: `Produto ${i + 1}`,
  quantity: 1,
  price,
  categories: [{ _id: categoryId, name: 'Leve 4 pague 3' }],
}));

const getApplication = () => ({
  data: {
    product_kit_discounts: [{
      label: 'leve4pague3',
      category_ids: [categoryId],
      min_quantity: 4,
      discount_lowest_price: true,
      discount: { apply_at: 'total' },
    }],
    freebies_rules: [{
      label: 'brinde',
      freebie_coupon: 'BRINDE',
      product_ids: ['683748d6f3c4f8399c499b51'],
      min_subtotal: 1,
    }],
  },
  hidden_data: {
    discount_rules: [{
      discount_coupon: 'ANIVERSARIO',
      case_insensitive: true,
      discount: { apply_at: 'total', type: 'percentage', value: 10 },
    }, {
      discount_coupon: 'VENCIDO',
      date_range: { end: '2020-01-01T00:00:00.000Z' },
      discount: { apply_at: 'total', type: 'fixed', value: 15 },
    }, {
      discount_coupon: 'MINIMO500',
      discount: {
        apply_at: 'total',
        type: 'fixed',
        value: 30,
        min_amount: 500,
      },
    }],
  },
});

const run = (discountCoupon) => applyDiscount({
  params: {
    lang: 'pt_br',
    currency_id: 'BRL',
    amount: { subtotal: 280, total: 280, discount: 0 },
    items,
    discount_coupon: discountCoupon,
  },
  application: getApplication(),
});

describe('Cupom digitado com campanha de kit ativa', () => {
  test('cupom inexistente mantém o kit e avisa que o cupom é inválido', async () => {
    const response = await run('testealeatorio');
    assert.deepStrictEqual(response.discount_rule.extra_discount, { value: 60, flags: ['KIT-1'] });
    assert.strictEqual(response.invalid_coupon_message, 'O cupom de desconto inserido é inválido.');
  });

  test('cupom vencido é tratado como inválido', async () => {
    const response = await run('VENCIDO');
    assert.strictEqual(response.discount_rule.extra_discount.value, 60);
    assert.strictEqual(response.invalid_coupon_message, 'O cupom de desconto inserido é inválido.');
  });

  test('cupom abaixo do valor mínimo informa quanto falta', async () => {
    const response = await run('MINIMO500');
    assert.strictEqual(response.discount_rule.extra_discount.value, 60);
    assert.strictEqual(
      response.invalid_coupon_message?.replace(/\s/g, ' '),
      'Adicione mais R$ 220,00 ao carrinho para usar este cupom.',
    );
  });

  test('cupom válido soma ao kit sem mensagem de erro', async () => {
    const response = await run('aniversario');
    assert.deepStrictEqual(response.discount_rule.extra_discount, {
      value: 82,
      flags: ['KIT-1', 'COUPON'],
    });
    assert.strictEqual(response.invalid_coupon_message, undefined);
  });

  test('cupom de brinde não é tratado como inválido', async () => {
    const response = await run('brinde');
    assert.deepStrictEqual(response.freebie_product_ids, ['683748d6f3c4f8399c499b51']);
    assert.strictEqual(response.invalid_coupon_message, undefined);
  });

  test('sem cupom não há mensagem de cupom', async () => {
    const response = await run(undefined);
    assert.strictEqual(response.discount_rule.extra_discount.value, 60);
    assert.strictEqual(response.invalid_coupon_message, undefined);
  });
});
