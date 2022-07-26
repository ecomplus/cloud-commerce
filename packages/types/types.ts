import type { Products } from './products';
import type { Categories } from './categories';
import type { Brands } from './brands';
import type { Collections } from './collections';
import type { Grids } from './grids';
import type { Carts } from './carts';
import type { Orders } from './orders';
import type { Customers } from './customers';
import type { Stores } from './stores';
import type { Applications } from './applications';
import type { Authentications } from './authentications';

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

type EventTopic = 'orders-new'
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
  EventTopic,
};
