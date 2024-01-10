import * as dotenv from 'dotenv';
import { test, expect } from 'vitest';
import api, { type ApiError } from '../src/api';

const productId = '618041aa239b7206d3fc06de' as string & { length: 24 };
test('Read product and typecheck SKU', async () => {
  const { data } = await api({
    storeId: 1056,
    endpoint: `products/${productId}`,
  });
  if (data.sku === '123') {
    console.log('\\o/');
  }
  console.log(data.sku);
  expect(data.sku).toBeTypeOf('string');
  expect(data._id).toBe(productId);
});

test('Find and read product by SKU', async () => {
  const { data } = await api({
    storeId: 1056,
    endpoint: 'products/sku:GFJ4714',
  });
  expect(data.sku).toBe('GFJ4714');
});

test('404 with different Store ID from env', async () => {
  try {
    const { data } = await api.get(`products/${productId}`, {
      storeId: 1011,
    });
    console.log(data);
    throw new Error('Should have thrown not found');
  } catch (err: any) {
    const error = err as ApiError;
    expect(error.statusCode).toBe(404);
    expect(error.response?.status).toBe(404);
  }
});

test('List categories and typecheck result', async () => {
  process.env.ECOM_STORE_ID = '1056';
  const { data } = await api.get('categories', {
    fields: ['name'] as const,
  });
  if (!data.result.length) {
    console.log('Any category found');
  }
  expect(Array.isArray(data.result)).toBe(true);
  expect(data.result[0].name).toBeTypeOf('string');
  // @ts-ignore
  expect(data.result[0].slug).toBeTypeOf('undefined');
  expect(data.meta).toBeTypeOf('object');
  expect(data.meta.offset).toBeTypeOf('number');
  const { data: data2 } = await api.get('categories', {
    limit: 1,
  });
  expect(data2.result.length).toBe(1);
  const { data: data3 } = await api.get('categories', {
    params: {
      slug: 'this-slug-doesnt-exists-123',
    },
  });
  expect(data3.result.length).toBe(0);
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

test('204 to update products views', async () => {
  dotenv.config();
  const isAuthenticating = !!process.env.ECOM_API_KEY;
  const { status } = await api.patch(`products/${productId}`, {
    views: 100,
  });
  expect(status).toBe(isAuthenticating ? 204 : 401);
});
