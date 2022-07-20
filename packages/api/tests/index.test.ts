/* eslint-disable no-console, import/no-extraneous-dependencies */

import { test, expect } from 'vitest';
import '../fetch-polyfill';
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

test('List categories and typecheck result', async () => {
  const { data } = await api.get('categories');
  if (data.result === []) {
    console.log('Any category found');
  }
  expect(Array.isArray(data.result)).toBe(true);
  expect(data.meta).toBeTypeOf('object');
  expect(data.meta.offset).toBeTypeOf('number');
});

test('401 trying to list API events', async () => {
  try {
    const { data } = await api.get('events/orders');
    console.log(data);
    console.log(data.result[0].modified_fields);
    throw new Error('Should have thrown unauthorized');
  } catch (err: any) {
    const error = err as ApiError;
    expect(error.statusCode).toBe(401);
    expect(error.response?.status).toBe(401);
  }
});

test('401 to create category and body typecheck', async () => {
  try {
    const { data } = await api.post('categories', {
      name: 'Test category',
    }, {
      accessToken: 'invalid',
    });
    console.log(data._id);
    throw new Error('Should have thrown unauthorized');
  } catch (err: any) {
    const error = err as ApiError;
    expect(error.statusCode).toBe(401);
    expect(error.response?.status).toBe(401);
  }
});
