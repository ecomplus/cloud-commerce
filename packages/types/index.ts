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
  Resource,
  ResourceId,
  ResourceListResult,
  EventsResult,
} from '@cloudcommerce/api/src/types';
import type { ApplyDiscountParams } from './modules/apply_discount:params';
import type { ApplyDiscountResponse } from './modules/apply_discount:response';
import type { CalculateShippingParams } from './modules/calculate_shipping:params';
import type { CalculateShippingResponse } from './modules/calculate_shipping:response';
import type { ListPaymentsParams } from './modules/list_payments:params';
import type { ListPaymentsResponse } from './modules/list_payments:response';
import type { CreateTransactionParams } from './modules/create_transaction:params';
import type { CreateTransactionResponse } from './modules/create_transaction:response';
import type { CheckoutBody } from './modules/@checkout:params';

type AppEventsTopic = 'orders-new'
  | 'orders-anyStatusSet'
  | 'orders-paid'
  | 'orders-readyForShipping'
  | 'orders-delivered'
  | 'orders-cancelled'
  | 'products-new'
  | 'products-quantitySet'
  | 'products-priceSet'
  | 'carts-new'
  | 'carts-customerSet';

type AppModuleName = 'apply_discount'
  | 'calculate_shipping'
  | 'list_payments'
  | 'create_transaction';

type AppModuleBody = {
  module: AppModuleName,
  params: {
    [key: string]: any,
  },
  application: Applications,
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
  Resource,
  ResourceId,
  ResourceListResult,
  EventsResult,
  AppEventsTopic,
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
};
