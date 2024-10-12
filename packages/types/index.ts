import type {
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
  ResourceListResult,
  SearchItem,
  SearchResult,
  EventsResult,
} from '@cloudcommerce/api/types';
import type { ApplyDiscountParams } from './modules/apply_discount:params';
import type { ApplyDiscountResponse } from './modules/apply_discount:response';
import type { CalculateShippingParams } from './modules/calculate_shipping:params';
import type { CalculateShippingResponse } from './modules/calculate_shipping:response';
import type { ListPaymentsParams } from './modules/list_payments:params';
import type { ListPaymentsResponse } from './modules/list_payments:response';
import type { CreateTransactionParams } from './modules/create_transaction:params';
import type { CreateTransactionResponse } from './modules/create_transaction:response';
import type { CheckoutBody } from './modules/@checkout:params';

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
  ResourceListResult,
  SearchItem,
  SearchResult,
  EventsResult,
  ApplyDiscountParams,
  ApplyDiscountResponse,
  CalculateShippingParams,
  CalculateShippingResponse,
  ListPaymentsParams,
  ListPaymentsResponse,
  CreateTransactionParams,
  CreateTransactionResponse,
  CheckoutBody,
};

export type ApiEventName = 'orders-new'
  | 'orders-anyStatusSet'
  | 'orders-paid'
  | 'orders-readyForShipping'
  | 'orders-shipped'
  | 'orders-delivered'
  | 'orders-cancelled'
  | 'products-new'
  | 'products-quantitySet'
  | 'products-priceSet'
  | 'carts-new'
  | 'carts-customerSet'
  | 'carts-delayed'
  | 'customers-new'
  | 'applications-dataSet';

export type AppEventsPayload = {
  evName: ApiEventName,
  apiEvent: EventsResult<'events/orders'>['result'][0],
  apiDoc: Record<string, any>,
  app: {
    _id: Applications['_id'],
    app_id: Applications['app_id'],
    data: Applications['data'],
    hidden_data: Applications['hidden_data'],
  },
  isInternal?: boolean,
};

export type AppModuleName = 'apply_discount'
  | 'calculate_shipping'
  | 'list_payments'
  | 'create_transaction';

export type AppModuleBody<M extends AppModuleName | undefined = undefined> = {
  storeId: number,
  module: AppModuleName,
  params:
    M extends 'list_payments' ? ListPaymentsParams :
    M extends 'calculate_shipping' ? CalculateShippingParams :
    M extends 'apply_discount' ? ApplyDiscountParams :
    M extends 'create_transaction' ? CreateTransactionParams :
    Record<string, any>,
  application: Partial<Applications> & {
    _id: Applications['_id'],
    state?: 'active',
    app_id: Applications['app_id'],
    version: Applications['version'],
    modules: Exclude<Applications['modules'], undefined>,
    data: Applications['data'],
    hidden_data: Applications['hidden_data'],
  },
};

export type AppModuleResponse<M extends AppModuleName | undefined = undefined> =
  M extends 'list_payments' ? ListPaymentsResponse :
  M extends 'calculate_shipping' ? CalculateShippingResponse :
  M extends 'apply_discount' ? ApplyDiscountResponse :
  M extends 'create_transaction' ? CreateTransactionResponse :
  Record<string, any>;

export type ModuleApiEndpoint = Exclude<AppModuleName, 'create_transaction'> | '@checkout';

export type ModuleApiParams<M extends ModuleApiEndpoint> =
  M extends 'list_payments' ? ListPaymentsParams :
  M extends 'calculate_shipping' ? CalculateShippingParams :
  M extends 'apply_discount' ? ApplyDiscountParams :
  M extends '@checkout' ? CheckoutBody :
  never;

export type ModuleApiResult<M extends ModuleApiEndpoint> = {
  result: {
    _id: Applications['_id'],
    app_id: Applications['app_id'],
    took: number,
    version: Applications['version'],
    validated: boolean,
    response_errors: null | string,
    error: boolean,
    error_message: null | string,
    response: M extends AppModuleName ? AppModuleResponse<M> : Record<string, any>,
  }[],
  meta: ModuleApiParams<M>,
};

type PaymentMethodFlag = 'pix'
  | 'visa'
  | 'mastercard'
  | 'elo'
  | 'amex'
  | 'hipercard'
  | 'boleto'
  | 'diners'
  | 'discover';

export type SettingsContent = {
  domain: string,
  name: string,
  description: string,
  logo: string,
  icon: string,
  favicon?: string,
  primaryColor: string,
  secondaryColor?: string,
  bgColor?: string,
  assetsPrefix?: string,
  email: string,
  phone: string,
  address: string,
  corporateName: string,
  docNumber: string,
  lang: string,
  currency: string,
  currencySymbol: string,
  countryCode: string,
  whatsapp?: string,
  instagram?: string,
  facebook?: string,
  twitter?: string,
  youtube?: string,
  tiktok?: string,
  pinterest?: string,
  threads?: string,
  serviceLinks?: Array<{
    title: string,
    href: string,
  }>,
  paymentMethods?: PaymentMethodFlag[],
  modules?: {
    list_payments?: {
      installments_option?: Partial<ListPaymentsResponse['installments_option']>,
      discount_option?: Partial<ListPaymentsResponse['discount_option']>,
      loyalty_points_program?: Partial<
        Exclude<ListPaymentsResponse['loyalty_points_programs'], undefined>[''] & {
          id: string,
        }>,
      loyalty_points_programs?: ListPaymentsResponse['loyalty_points_programs'],
    },
    calculate_shipping?: {
      free_shipping_from_value?: CalculateShippingResponse['free_shipping_from_value'] | null,
    },
    apply_discount?: {
      available_extra_discount?: Partial<ApplyDiscountResponse['available_extra_discount']>,
    },
  },
  cartUrl?: string,
  checkoutUrl?: string,
  accountUrl?: string,
  ordersUrl?: string,
  favoritesUrl?: string,
  metafields?: Record<string, any>,
};
