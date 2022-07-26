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
import type { ApplyDiscountParams } from '@cloudcommerce/modules/schemas/types/apply_discount:params';
import type { ApplyDiscountResponse } from '@cloudcommerce/modules/schemas/types/apply_discount:response';
import type { CalculateShippingParams } from '@cloudcommerce/modules/schemas/types/calculate_shipping:params';
import type { CalculateShippingResponse } from '@cloudcommerce/modules/schemas/types/calculate_shipping:response';
import type { ListPaymentsParams } from '@cloudcommerce/modules/schemas/types/list_payments:params';
import type { ListPaymentsResponse } from '@cloudcommerce/modules/schemas/types/list_payments:response';
import type { CreateTransactionParams } from '@cloudcommerce/modules/schemas/types/create_transaction:params';
import type { CreateTransactionResponse } from '@cloudcommerce/modules/schemas/types/create_transaction:response';
import type { CheckoutBody } from '@cloudcommerce/modules/schemas/types/@checkout:params';

type AppEventsTopic = 'orders-new'
  | 'orders-setAnyStatus'
  | 'orders-paid'
  | 'orders-readyForShipping'
  | 'orders-delivered'
  | 'orders-cancelled'
  | 'products-new'
  | 'products-setQuantity'
  | 'products-setPrice'
  | 'carts-new'
  | 'carts-setCustomer';

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
