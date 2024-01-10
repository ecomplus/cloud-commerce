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
type ResourceAndFind = ResourceAndId
  | `${Resource}/${string}:${string}`
  | 'stores/me'
  | 'authentications/me';
type ResourceOpQuery = Resource | `${Resource}?${string}`;

type SearchV1OpQuery = 'search/v1'
  | `search/v1?${string}`;
type SearchOpQuery = SearchV1OpQuery
  | 'search/_els'
  | `search/_els?${string}`;

type SearchHistoryOpQuery = 'search/v1/history'
  | `search/v1/history?${string}`;

type EventsEndpoint = `events/${Resource}`
  | `events/${ResourceAndId}`
  | 'events/me';

type Endpoint = ResourceOpQuery
  | ResourceAndFind
  | `${ResourceAndFind}/${string}`
  | `slugs/${string}`
  | SearchOpQuery
  | SearchHistoryOpQuery
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
  fields?: readonly string[],
  sort?: readonly string[],
  limit?: number,
  offset?: number,
  count?: boolean,
  buckets?: boolean,
  verbose?: boolean,
  concise?: boolean,
  params?: string | Record<
    string,
    string | number | boolean | string[] | number[] | undefined,
  >,
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

type DocField<T extends string> = T extends `${infer U}.${string}` ? U : T;
type ListResultDocs<
  Document extends Record<string, any>,
  Fields extends string[] | '*' = '*',
> = Array<Omit<(
  Fields extends '*' ? Partial<Document> :
  Pick<Document, Extract<keyof Document, DocField<Fields[number]>>>
), '_id'> & { _id: ResourceId }>;

type DefaultProductsFields = [
  'sku',
  'slug',
];
type ProductsList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Products, Fields extends null ? DefaultProductsFields : Fields>;

type DefaultCategoriesFields = [
  'name',
  'slug',
  'parent',
  'icon',
  'pictures.0',
];
type CategoriesList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Categories, Fields extends null ? DefaultCategoriesFields : Fields>;

type DefaultBrandsFields = [
  'name',
  'slug',
  'logo',
  'pictures.0',
];
type BrandsList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Brands, Fields extends null ? DefaultBrandsFields : Fields>;

type DefaultCollectionsFields = [
  'name',
  'slug',
  'products',
  'pictures.0',
];
type CollectionsList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Collections, Fields extends null ? DefaultCollectionsFields : Fields>;

type DefaultGridsFields = [
  'title',
  'grid_id',
  'options.text',
  'options.colors',
];
type GridsList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Grids, Fields extends null ? DefaultGridsFields : Fields>;

type DefaultCartsFields = [
  'available',
  'completed',
  'permalink',
  'status',
  'customers',
  'other_customers',
  'items.product_id',
  'items.sku',
  'items.name',
  'items.quantity',
  'items.final_price',
  'subtotal',
];
type CartsList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Carts, Fields extends null ? DefaultCartsFields : Fields>;

type DefaultOrdersFields = [
  'channel_id',
  'number',
  'code',
  'status',
  'financial_status.updated_at',
  'financial_status.current',
  'fulfillment_status.updated_at',
  'fulfillment_status.current',
  'amount',
  'payment_method_label',
  'shipping_method_label',
  'buyers._id',
  'buyers.main_email',
  'buyers.display_name',
  'items.product_id',
  'items.sku',
  'items.name',
  'items.quantity',
];
type OrdersList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Orders, Fields extends null ? DefaultOrdersFields : Fields>;

type DefaultCustomersFields = [
  'state',
  'enabled',
  'login',
  'status',
  'main_email',
  'accepts_marketing',
  'display_name',
  'orders_count',
  'orders_total_value',
];
type CustomersList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Customers, Fields extends null ? DefaultCustomersFields : Fields>;

type DefaultStoresFields = [
  'store_id',
  'name',
  'domain',
];
type StoresList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Stores, Fields extends null ? DefaultStoresFields : Fields>;

type DefaultApplicationsFields = [
  'app_id',
  'title',
  'state',
  'version',
  'type',
];
type ApplicationsList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Applications, Fields extends null ? DefaultApplicationsFields : Fields>;

type DefaultAuthenticationsFields = [
  'username',
  'email',
  'app',
];
type AuthenticationsList<Fields extends null | string[] | '*' = '*'> =
  ListResultDocs<Authentications, Fields extends null ? DefaultAuthenticationsFields : Fields>;

type ListEndpoint<TResource extends Resource> = TResource | `${TResource}?${string}`;
type ResourceListResult<
  TEndpoint extends ResourceOpQuery,
  Fields extends string[] | null = TEndpoint extends Resource ? null : '*',
> = {
  result:
    TEndpoint extends ListEndpoint<'products'> ? ProductsList<Fields> :
    TEndpoint extends ListEndpoint<'categories'> ? CategoriesList<Fields> :
    TEndpoint extends ListEndpoint<'brands'> ? BrandsList<Fields> :
    TEndpoint extends ListEndpoint<'collections'> ? CollectionsList<Fields> :
    TEndpoint extends ListEndpoint<'grids'> ? GridsList<Fields> :
    TEndpoint extends ListEndpoint<'carts'> ? CartsList<Fields> :
    TEndpoint extends ListEndpoint<'orders'> ? OrdersList<Fields> :
    TEndpoint extends ListEndpoint<'customers'> ? CustomersList<Fields> :
    TEndpoint extends ListEndpoint<'stores'> ? StoresList<Fields> :
    TEndpoint extends ListEndpoint<'applications'> ? ApplicationsList<Fields> :
    TEndpoint extends ListEndpoint<'authentications'> ? AuthenticationsList<Fields> :
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

interface SearchProducts extends Products {
  has_variations: boolean;
  _score: number;
}
type DefaultSearchFields = [
  'sku',
  'name',
  'slug',
  'available',
  'visible',
  'price',
  'base_price',
  'quantity',
  'min_quantity',
  'inventory',
  'measurement',
  'condition',
  'warranty',
  'pictures.normal',
  'has_variations',
];

type SearchItem<Fields extends null | string[] | '*' = '*'> = Omit<(
  Fields extends '*' ? Partial<SearchProducts> :
  Pick<
    SearchProducts,
    Extract<keyof SearchProducts,
      DocField<Fields extends null ? DefaultSearchFields[number] : Fields[number]>>
  >
), '_id' | '_score'> & {
  _id: ResourceId,
  _score: number,
};

type SearchResult<
  TEndpoint extends SearchOpQuery | 'v1' | 'els',
  Fields extends string[] | null = TEndpoint extends SearchV1OpQuery | 'v1' ? null : '*',
> =
  TEndpoint extends SearchV1OpQuery | 'v1' ? {
    result: SearchItem<Fields>[],
    meta: BaseListResultMeta & {
      count?: number,
      sort: Array<{
        field: string,
        order: 1 | -1,
      }>,
      query: { [key: string]: any },
      buckets?: {
        prices?: Array<{
          min: null | number,
          max: null | number,
          avg: null | number,
          count: number,
        }>,
        'brands.name'?: {
          [key: string]: number,
        },
        'categories.name'?: {
          [key: string]: number,
        },
        specs?: {
          [key: string]: number,
        },
      },
    },
  } :
  TEndpoint extends 'search/_els' | `search/_els?${string}` | 'els' ? {
    hits: {
      hits: SearchItem<'*'>[],
      total: number,
      max_score: null,
    },
    aggregations: Record<string, any>,
    took: number,
  } :
  never;

type SearchHistoryResult = {
  result: Array<{
    terms: string[];
    hits_count?: number;
    counted_at?: string;
  }>,
  meta: {
    offset: number,
    limit: number,
    query: {
      terms?: any,
    },
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

type ResponseBody<
  TConfig extends Config,
  ListFields extends string[] | null = TConfig['endpoint'] extends Resource | SearchV1OpQuery
    ? TConfig['params']['fields'] extends string ? '*'
      : TConfig['fields'] extends readonly string[] ? TConfig['fields']
      : null
    : '*',
> =
  TConfig['method'] extends 'post' ?
    TConfig['endpoint'] extends 'login' ? { _id: ResourceId, store_ids: number[], api_key: string } :
    TConfig['endpoint'] extends 'authenticate' ? { my_id: string, access_token: string, expires: string } :
    { _id: ResourceId } :
  TConfig['method'] extends 'put' | 'patch' | 'delete' ? null :
  // method?: 'get'
  TConfig['endpoint'] extends `${string}/${ResourceId}/${string}` ? any :
  TConfig['endpoint'] extends ResourceAndFind ?
    TConfig['endpoint'] extends `products/${string}` ? Products :
    TConfig['endpoint'] extends `categories/${string}` ? Categories :
    TConfig['endpoint'] extends `brands/${string}` ? Brands :
    TConfig['endpoint'] extends `collections/${string}` ? Collections :
    TConfig['endpoint'] extends `grids/${string}` ? Grids :
    TConfig['endpoint'] extends `carts/${string}` ? Carts :
    TConfig['endpoint'] extends `orders/${string}` ? Orders :
    TConfig['endpoint'] extends `customers/${string}` ? Customers :
    TConfig['endpoint'] extends `applications/${string}` ? Applications :
    TConfig['endpoint'] extends `authentications/${string}` ? Authentications :
    TConfig['endpoint'] extends `stores/${string}` ? Stores :
    any :
  TConfig['endpoint'] extends ResourceOpQuery ? ResourceListResult<TConfig['endpoint'], ListFields> :
  TConfig['endpoint'] extends SearchOpQuery ? SearchResult<TConfig['endpoint'], ListFields> :
  TConfig['endpoint'] extends SearchHistoryOpQuery ? SearchHistoryResult :
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
  TConfig['endpoint'] extends SetDocEndpoint<'products'>
    ? TConfig['method'] extends 'patch' ? Partial<ProductSet> : ProductSet :
  TConfig['endpoint'] extends SetDocEndpoint<'categories'>
    ? TConfig['method'] extends 'patch' ? Partial<CategorySet> : CategorySet :
  TConfig['endpoint'] extends SetDocEndpoint<'brands'>
    ? TConfig['method'] extends 'patch' ? Partial<BrandSet> : BrandSet :
  TConfig['endpoint'] extends SetDocEndpoint<'collections'>
    ? TConfig['method'] extends 'patch' ? Partial<CollectionSet> : CollectionSet :
  TConfig['endpoint'] extends SetDocEndpoint<'grids'>
    ? TConfig['method'] extends 'patch' ? Partial<GridSet> : GridSet :
  TConfig['endpoint'] extends SetDocEndpoint<'carts'>
    ? TConfig['method'] extends 'patch' ? Partial<CartSet> : CartSet :
  TConfig['endpoint'] extends SetDocEndpoint<'orders'>
    ? TConfig['method'] extends 'patch' ? Partial<OrderSet> : OrderSet :
  TConfig['endpoint'] extends SetDocEndpoint<'customers'>
    ? TConfig['method'] extends 'patch' ? Partial<CustomerSet> : CustomerSet :
  TConfig['endpoint'] extends SetDocEndpoint<'stores'>
    ? TConfig['method'] extends 'patch' ? Partial<StoreSet> : StoreSet :
  TConfig['endpoint'] extends SetDocEndpoint<'applications'>
    ? TConfig['method'] extends 'patch' ? Partial<ApplicationSet> : ApplicationSet :
  TConfig['endpoint'] extends SetDocEndpoint<'authentications'>
    ? TConfig['method'] extends 'patch' ? Partial<AuthenticationSet> : AuthenticationSet :
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
  ProductsList,
  CategoriesList,
  BrandsList,
  CollectionsList,
  GridsList,
  CartsList,
  OrdersList,
  CustomersList,
  StoresList,
  ApplicationsList,
  AuthenticationsList,
  Resource,
  ResourceId,
  ResourceAndId,
  ResourceAndFind,
  ResourceOpQuery,
  Endpoint,
  Method,
  Config,
  ResourceListResult,
  SearchItem,
  SearchResult,
  EventsResult,
  ResponseBody,
  RequestBody,
  ErrorBody,
};
