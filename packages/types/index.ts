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

type ApiEventName = 'orders-new'
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

type AppEventsPayload = {
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

type AppModuleName = 'apply_discount'
  | 'calculate_shipping'
  | 'list_payments'
  | 'create_transaction';

type AppModuleBody = {
  storeId: number,
  module: AppModuleName,
  params: {
    [key: string]: any,
  },
  application: Applications,
};

type CmsSettings = {
  domain: string,
  name: string,
  description: string,
  logo: string,
  icon: string,
  primary_color: string,
  secondary_color?: string,
  bg_color?: string,
  email: string,
  phone: string,
  address: string,
  corporate_name: string,
  doc_number: string,
  lang: string,
  currency: string,
  currency_symbol: string,
  country_code: string,
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
  ResourceListResult,
  EventsResult,
  ApiEventName,
  AppEventsPayload,
  AppModuleName,
  AppModuleBody,
  ApplyDiscountParams,
  ApplyDiscountResponse,
  CalculateShippingParams,
  CalculateShippingResponse,
  ListPaymentsParams,
  ListPaymentsResponse,
  CreateTransactionParams,
  CreateTransactionResponse,
  CheckoutBody,
  CmsSettings,
};
