import type { Products } from './types/products';
import type { Categories } from './types/categories';
import type { Brands } from './types/brands';
import type { Collections } from './types/collections';
import type { Grids } from './types/grids';
import type { Carts } from './types/carts';
import type { Orders } from './types/orders';
import type { Customers } from './types/customers';
import type { Stores } from './types/stores';
import type { Applications } from './types/applications';

type Resource = 'products'
  | 'categories'
  | 'brands'
  | 'collections'
  | 'grids'
  | 'carts'
  | 'orders'
  | 'customers'
  | 'stores'
  | 'applications';

type ResourceId = string & { length: 24 };

type ResourceAndId = `${Resource}/${ResourceId}`;

type Endpoint = Resource | ResourceAndId | `${ResourceAndId}/${string}`;

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

type Config = {
  baseUrl?: string,
  storeId?: number,
  lang?: string,
  method: Method,
  endpoint: Endpoint,
  params?: Record<string, string | number>,
  headers?: Record<string, string>,
  timeout?: number,
};

type ResponseBody<T> =
  T extends Config & { method: 'post' } ? { _id: ResourceId } :
  T extends Config & { method: 'put' | 'patch' | 'delete' } ? null :
  T extends Config & { method: 'get', endpoint: `products/${ResourceId}` } ? Products :
  T extends Config & { method: 'get', endpoint: `categories/${ResourceId}` } ? Categories :
  T extends Config & { method: 'get', endpoint: `brands/${ResourceId}` } ? Brands :
  T extends Config & { method: 'get', endpoint: `collections/${ResourceId}` } ? Collections :
  T extends Config & { method: 'get', endpoint: `grids/${ResourceId}` } ? Grids :
  T extends Config & { method: 'get', endpoint: `carts/${ResourceId}` } ? Carts :
  T extends Config & { method: 'get', endpoint: `orders/${ResourceId}` } ? Orders :
  T extends Config & { method: 'get', endpoint: `customers/${ResourceId}` } ? Customers :
  T extends Config & { method: 'get', endpoint: `stores/${ResourceId}` } ? Stores :
  T extends Config & { method: 'get', endpoint: `applications/${ResourceId}` } ? Applications :
  any

export type {
  Products,
  Categories,
  Brands,
  Collections,
  Grids,
  Carts,
  Orders,
  Customers,
  Stores,
  Applications,
  Resource,
  ResourceAndId,
  Endpoint,
  Method,
  Config,
  ResponseBody,
};
