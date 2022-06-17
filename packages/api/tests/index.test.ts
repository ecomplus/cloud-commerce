/* eslint-disable no-console, import/no-extraneous-dependencies */

import { test, expect } from 'vitest';
import './fetch-polyfill';
import api, { ApiError } from '../src/index';

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

test('404 with different Store ID from env', async () => {
  process.env.ECOM_STORE_ID = '1011';
  try {
    const { data } = await api.get(`products/${productId}`);
    console.log(data);
    throw new Error('Should have thrown not found');
  } catch (err: any) {
    const error = err as ApiError;
    expect(error.statusCode).toBe(404);
    expect(error.response?.status).toBe(404);
  }
});
