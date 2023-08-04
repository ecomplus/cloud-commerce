import type {
  ProductSet,
  CategorySet,
  BrandSet,
  CollectionSet,
} from '@cloudcommerce/api/types';
import type { SettingsContent } from '@@sf/content';

export type $Storefront = {
  settings: Partial<SettingsContent>,
  apiContext?: {
    resource: 'products',
    doc: ProductSet,
    timestamp: number,
  } | {
    resource: 'categories',
    doc: CategorySet,
    timestamp: number,
  } | {
    resource: 'brands',
    doc: BrandSet,
    timestamp: number,
  } | {
    resource: 'collections',
    doc: CollectionSet,
    timestamp: number,
  },
  data: Record<string, any>,
};
