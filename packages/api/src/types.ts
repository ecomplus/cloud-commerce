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
  | 'applications'
  | 'authentications';

type ResourceId = string & { length: 24 };

type ResourceAndId = `${Resource}/${ResourceId}`;

type EventsEndpoint = `events/${Resource}`
  | `events/${ResourceAndId}`
  | 'events/me';

type Endpoint = Resource
  | ResourceAndId
  | `${ResourceAndId}/${string}`
  | `slugs/${string}`
  | 'search/v1'
  | EventsEndpoint
  | 'login'
  | 'authenticate'
  | 'ask-auth-callback'
  | 'check-username'
  | `$aggregate/${Exclude<Resource, 'stores' | 'applications'>}`
  | `schemas/${Resource}`;

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
  fetch?: typeof fetch,
};

type BaseListResultMeta = {
  offset: number,
  limit: number,
  fields: Array<string>,
};

type ResourceListResult<TResource extends Resource> = {
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
  meta: BaseListResultMeta & {
    count?: number,
    sort: Array<{
      field: string,
      order: 1 | -1,
    }>,
    query: { [key: string]: any },
  },
};

type EventFieldsByEndpoint<TEndpoint extends EventsEndpoint> =
  TEndpoint extends `events/${Resource}` ? {
    resource_id: ResourceId,
    authentication_id: ResourceId | null,
  } :
  TEndpoint extends `events/${ResourceAndId}` ? {
    authentication_id: ResourceId | null,
  } :
  TEndpoint extends 'events/me' ? {
    resource: Resource,
    resource_id: ResourceId,
  } :
  never;

type EventsResult<TEndpoint extends EventsEndpoint> = {
  result: Array<{
    timestamp: string,
    store_id?: number,
    resource?: string,
    authentication_id?: ResourceId | null,
    resource_id?: ResourceId,
    action: string,
    modified_fields: string[],
    method?: number | undefined,
    endpoint?: string,
    body?: any,
    ip?: string,
  } & EventFieldsByEndpoint<TEndpoint>>,
  meta: BaseListResultMeta,
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
  TConfig['endpoint'] extends Resource ? ResourceListResult<TConfig['endpoint']> :
  TConfig['endpoint'] extends EventsEndpoint ? EventsResult<TConfig['endpoint']> :
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
