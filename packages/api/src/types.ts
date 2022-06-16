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
  method?: Method,
  endpoint: Endpoint,
  params?: Record<string, string | number>,
  headers?: Record<string, string>,
  timeout?: number,
  maxRetries?: number,
};

type ReadConfig<endpoint> = Config & { method?: 'get', endpoint: endpoint };

type ResponseBody<T> =
  T extends Config & { method: 'post' } ? { _id: ResourceId } :
  T extends Config & { method: 'put' | 'patch' | 'delete' } ? null :
  T extends ReadConfig<`products/${ResourceId}`> ? Products :
  T extends ReadConfig<`categories/${ResourceId}`> ? Categories :
  T extends ReadConfig<`brands/${ResourceId}`> ? Brands :
  T extends ReadConfig<`collections/${ResourceId}`> ? Collections :
  T extends ReadConfig<`grids/${ResourceId}`> ? Grids :
  T extends ReadConfig<`carts/${ResourceId}`> ? Carts :
  T extends ReadConfig<`orders/${ResourceId}`> ? Orders :
  T extends ReadConfig<`customers/${ResourceId}`> ? Customers :
  T extends ReadConfig<`stores/${ResourceId}`> ? Stores :
  T extends ReadConfig<`applications/${ResourceId}`> ? Applications :
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
