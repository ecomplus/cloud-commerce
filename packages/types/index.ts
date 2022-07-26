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
};
