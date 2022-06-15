/* eslint-disable no-console, import/no-extraneous-dependencies */

import { test, expect } from 'vitest';
import './fetch-polyfill';
import api from '../src/index';

const productId = '618041aa239b7206d3fc06de';
test('Read product and typecheck SKU', async () => {
  const { data } = await api({
    storeId: 1056,
    endpoint: `products/${productId}`,
  });
  if (data.sku === '123') {
    console.log('\\o/');
  }
  expect(data.sku).toBeTypeOf('string');
  expect(data._id).toBe(productId);
});
