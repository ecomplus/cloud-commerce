import assert from 'node:assert';
import test, { describe } from 'node:test';
import { calculateShipping } from '../lib/custom-shipping-calculate.js';

// GO zip range with "3% of cart, at least R$ 150" (Bom Ar own delivery rule)
const rule = () => ({
  service_code: 'GO',
  label: 'Entrega Bom Ar',
  zip_range: { min: 72800000, max: 76799999 },
  amount_tax: 3,
  min_price: 150,
  delivery_time: { days: 3, working_days: true },
});

const calc = (subtotal, zip = '74543010', rules = [rule()]) => calculateShipping({
  application: { data: { zip: '74543010', shipping_rules: rules }, hidden_data: {} },
  params: {
    to: zip && { zip },
    subtotal,
    items: [{
      product_id: '1', sku: 'A', name: 'Split', price: subtotal, quantity: 1, weight: { value: 30, unit: 'kg' },
    }],
  },
});

describe('Custom shipping minimum price', () => {
  test('uses the floor when the percentage is lower', async () => {
    const { shipping_services: services } = await calc(3000);
    assert.strictEqual(services.length, 1);
    assert.strictEqual(services[0].shipping_line.total_price, 150);
  });

  test('uses the percentage when it is higher than the floor', async () => {
    const { shipping_services: services } = await calc(10000);
    assert.strictEqual(services[0].shipping_line.total_price, 300);
  });

  test('does not leak min_price into the shipping line', async () => {
    const { shipping_services: services } = await calc(3000);
    assert.strictEqual(services[0].shipping_line.min_price, undefined);
  });

  test('keeps rules without floor unchanged', async () => {
    const noFloor = { ...rule() };
    delete noFloor.min_price;
    const { shipping_services: services } = await calc(3000, '74543010', [noFloor]);
    assert.strictEqual(services[0].shipping_line.total_price, 90);
  });

  test('ignores destinations outside the zip range', async () => {
    const { shipping_services: services } = await calc(3000, '01310100');
    assert.strictEqual(services.length, 0);
  });

  test('rule with only a floor is not a free shipping preview', async () => {
    const floorOnly = { service_code: 'GO', zip_range: rule().zip_range, min_price: 150 };
    const res = await calc(3000, null, [floorOnly]);
    assert.notStrictEqual(res.free_shipping_from_value, 0);
  });
});
