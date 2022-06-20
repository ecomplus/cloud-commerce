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

type ListResult<TResource extends Resource> = {
  result:
    TResource extends 'products' ? Products[] :
    TResource extends 'categories' ? Categories[] :
    TResource extends 'brands' ? Brands[] :
    TResource extends 'collections' ? Collections[] :
    TResource extends 'grids' ? Grids[] :
    TResource extends 'carts' ? Carts[] :
    TResource extends 'orders' ? Orders[] :
    TResource extends 'customers' ? Customers[] :
    TResource extends 'stores' ? Stores[] :
    TResource extends 'applications' ? Applications[] :
    never,
  meta: {
    offset: number,
    limit: number,
    count?: number,
    sort: Array<{
      field: string,
      order: 1 | -1,
    }>,
    query: { [key: string]: any },
    fields: Array<string>,
  },
};

type ResponseBody<TConfig extends Config> =
  TConfig['method'] extends 'post' ? { _id: ResourceId } :
  TConfig['method'] extends 'put' | 'patch' | 'delete' ? null :
  // method?: 'get'
  TConfig['endpoint'] extends `products/${ResourceId}` ? Products :
  TConfig['endpoint'] extends `categories/${ResourceId}` ? Categories :
  TConfig['endpoint'] extends `brands/${ResourceId}` ? Brands :
  TConfig['endpoint'] extends `collections/${ResourceId}` ? Collections :
  TConfig['endpoint'] extends `grids/${ResourceId}` ? Grids :
  TConfig['endpoint'] extends `carts/${ResourceId}` ? Carts :
  TConfig['endpoint'] extends `orders/${ResourceId}` ? Orders :
  TConfig['endpoint'] extends `customers/${ResourceId}` ? Customers :
  TConfig['endpoint'] extends `stores/${ResourceId}` ? Stores :
  TConfig['endpoint'] extends `applications/${ResourceId}` ? Applications :
  TConfig['endpoint'] extends Resource ? ListResult<TConfig['endpoint']> :
  any;

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
