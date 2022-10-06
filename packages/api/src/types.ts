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
import type { Authentications } from './types/authentications';

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

type ResourceOpQuery = Resource | `${Resource}?${string}`;

type EventsEndpoint = `events/${Resource}`
  | `events/${ResourceAndId}`
  | 'events/me';

type Endpoint = ResourceOpQuery
  | ResourceAndId
  | `${ResourceAndId}/${string}`
  | `slugs/${string}`
  | 'search/v1'
  | EventsEndpoint
  | 'login'
  | 'authenticate'
  | 'ask-auth-callback'
  | 'check-username'
  | `$aggregate/${Exclude<Resource, 'stores' | 'applications' | 'authentications'>}`
  | `schemas/${Resource}`;

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

type Config = {
  baseUrl?: string,
  storeId?: number,
  accessToken?: string,
  authenticationId?: string,
  apiKey?: string,
  isNoAuth?: boolean,
  lang?: string,
  method?: Method,
  endpoint: Endpoint,
  params?: Record<string, string | number | boolean | string[] | number[]> | string,
  headers?: Headers | Record<string, string>,
  timeout?: number,
  maxRetries?: number,
  canCache?: boolean,
  cacheMaxAge?: number,
  fetch?: typeof fetch,
};

type BaseListResultMeta = {
  offset: number,
  limit: number,
  fields: Array<string>,
};

type ListEndpoint<TResource extends Resource> = TResource | `${TResource}?${string}`;
type ListResultDocs<Document extends any> = Array<Partial<Document> & { _id: ResourceId }>;
type ResourceListResult<TEndpoint extends ResourceOpQuery> = {
  result:
    TEndpoint extends ListEndpoint<'products'> ? ListResultDocs<Products> :
    TEndpoint extends ListEndpoint<'categories'> ? ListResultDocs<Categories> :
    TEndpoint extends ListEndpoint<'brands'> ? ListResultDocs<Brands> :
    TEndpoint extends ListEndpoint<'collections'> ? ListResultDocs<Collections> :
    TEndpoint extends ListEndpoint<'grids'> ? ListResultDocs<Grids> :
    TEndpoint extends ListEndpoint<'carts'> ? ListResultDocs<Carts> :
    TEndpoint extends ListEndpoint<'orders'> ? ListResultDocs<Orders> :
    TEndpoint extends ListEndpoint<'customers'> ? ListResultDocs<Customers> :
    TEndpoint extends ListEndpoint<'stores'> ? ListResultDocs<Stores> :
    TEndpoint extends ListEndpoint<'applications'> ? ListResultDocs<Applications> :
    TEndpoint extends ListEndpoint<'authentications'> ? ListResultDocs<Authentications> :
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
  TConfig['method'] extends 'post' ?
    TConfig['endpoint'] extends 'login' ? { _id: ResourceId, store_ids: number[], api_key: string } :
    TConfig['endpoint'] extends 'authenticate' ? { my_id: string, access_token: string, expires: string } :
    { _id: ResourceId } :
  TConfig['method'] extends 'put' | 'patch' | 'delete' ? null :
  // method?: 'get'
  TConfig['endpoint'] extends `${string}/${ResourceId}/${string}` ? any :
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
  TConfig['endpoint'] extends `authentications/${ResourceId}` ? Authentications :
  TConfig['endpoint'] extends ResourceOpQuery ? ResourceListResult<TConfig['endpoint']> :
  TConfig['endpoint'] extends EventsEndpoint ? EventsResult<TConfig['endpoint']> :
  any;

type DocSchema<Document extends any> =
  Omit<Document, '_id' | 'store_id' | 'store_ids' | 'created_at' | 'updated_at'>;
type CustomerSet = DocSchema<Customers>;
type OrderSet = DocSchema<Orders>;
type CartSet = DocSchema<Carts>;
type ProductSet = DocSchema<Products>;
type CategorySet = DocSchema<Categories>;
type BrandSet = DocSchema<Brands>;
type CollectionSet = DocSchema<Collections>;
type GridSet = DocSchema<Grids>;
type StoreSet = DocSchema<Stores>;
type ApplicationSet = DocSchema<Applications>;
type AuthenticationSet = DocSchema<Authentications>;

type SetDocEndpoint<TResource extends Resource> = TResource | `${TResource}/${ResourceId}`;

type RequestBody<TConfig extends Config> =
  TConfig['method'] extends undefined | 'get' | 'delete' ? undefined :
  TConfig['method'] extends 'patch' ? any : // TODO: partial body
  // method: 'post' | 'put'
  TConfig['endpoint'] extends SetDocEndpoint<'products'> ? ProductSet :
  TConfig['endpoint'] extends SetDocEndpoint<'categories'> ? CategorySet :
  TConfig['endpoint'] extends SetDocEndpoint<'brands'> ? BrandSet :
  TConfig['endpoint'] extends SetDocEndpoint<'collections'> ? CollectionSet :
  TConfig['endpoint'] extends SetDocEndpoint<'grids'> ? GridSet :
  TConfig['endpoint'] extends SetDocEndpoint<'carts'> ? CartSet :
  TConfig['endpoint'] extends SetDocEndpoint<'orders'> ? OrderSet :
  TConfig['endpoint'] extends SetDocEndpoint<'customers'> ? CustomerSet :
  TConfig['endpoint'] extends SetDocEndpoint<'stores'> ? StoreSet :
  TConfig['endpoint'] extends SetDocEndpoint<'applications'> ? ApplicationSet :
  TConfig['endpoint'] extends SetDocEndpoint<'authentications'> ? AuthenticationSet :
  any;

type ErrorBody = {
  status: number,
  error_code: number,
  message: string,
  user_message?: {
    en_us: string,
    pt_br: string,
  },
  more_info?: string,
};

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
  Authentications,
  ProductSet,
  CategorySet,
  BrandSet,
  CollectionSet,
  GridSet,
  CartSet,
  OrderSet,
  CustomerSet,
  StoreSet,
  ApplicationSet,
  AuthenticationSet,
  Resource,
  ResourceId,
  ResourceAndId,
  ResourceOpQuery,
  Endpoint,
  Method,
  Config,
  ResourceListResult,
  EventsResult,
  ResponseBody,
  RequestBody,
  ErrorBody,
};
