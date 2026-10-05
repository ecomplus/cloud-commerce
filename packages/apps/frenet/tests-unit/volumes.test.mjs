import assert from 'node:assert';
import test, { describe } from 'node:test';
import { parseVolumes, buildShippingItems } from '../lib-mjs/volumes.mjs';

const metafield = (value) => [{ namespace: 'shipping', field: 'volumes', value }];
const split = {
  product_id: 'p1',
  sku: '868',
  quantity: 2,
  weight: { value: 32, unit: 'kg' },
  dimensions: {
    length: { value: 90, unit: 'cm' },
    width: { value: 60, unit: 'cm' },
    height: { value: 40, unit: 'cm' },
  },
};

describe('Product volumes', () => {
  test('parses volumes from the hidden metafield', () => {
    assert.deepStrictEqual(
      parseVolumes(metafield('[{"kg":9.5,"cm":[90,30,25]},{"kg":23,"cm":[80,60,35]}]')),
      [
        {
          weight: 9.5, length: 90, width: 30, height: 25,
        },
        {
          weight: 23, length: 80, width: 60, height: 35,
        },
      ],
    );
  });

  test('ignores missing, invalid or incomplete volumes', () => {
    assert.strictEqual(parseVolumes(undefined), null);
    assert.strictEqual(parseVolumes([{ namespace: 'other', field: 'volumes', value: '[]' }]), null);
    assert.strictEqual(parseVolumes(metafield('not json')), null);
    assert.strictEqual(parseVolumes(metafield('[]')), null);
    assert.strictEqual(parseVolumes(metafield('[{"kg":9,"cm":[90,30]}]')), null);
    assert.strictEqual(parseVolumes(metafield('[{"kg":0,"cm":[90,30,25]}]')), null);
  });

  test('sends one package per volume, keeping the quantity', () => {
    const volumes = parseVolumes(metafield('[{"kg":9.5,"cm":[90,30,25]},{"kg":23,"cm":[80,60,35]}]'));
    assert.deepStrictEqual(buildShippingItems([split], { p1: volumes }), [
      {
        Weight: 9.5, Length: 90, Height: 25, Width: 30, Quantity: 2, SKU: '868-1',
      },
      {
        Weight: 23, Length: 80, Height: 35, Width: 60, Quantity: 2, SKU: '868-2',
      },
    ]);
  });

  test('keeps a single package from product data without volumes', () => {
    assert.deepStrictEqual(buildShippingItems([split], {}), [{
      Weight: 32, Length: 90, Height: 40, Width: 60, Quantity: 2, SKU: '868',
    }]);
  });
});
