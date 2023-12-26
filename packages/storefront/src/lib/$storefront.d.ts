import type {
  Products,
  Categories,
  Brands,
  Collections,
  Grids,
} from '@cloudcommerce/api/types';
import type { SettingsContent } from '@@sf/content';

export type $Storefront = {
  settings: Partial<SettingsContent>,
  apiContext?: {
    resource: 'products',
    doc: Products,
    timestamp: number,
  } | {
    resource: 'categories',
    doc: Categories,
    timestamp: number,
  } | {
    resource: 'brands',
    doc: Brands,
    timestamp: number,
  } | {
    resource: 'collections',
    doc: Collections,
    timestamp: number,
  },
  data: Record<string, any> & {
    categories?: Array<Partial<Categories>>,
    brands?: Array<Partial<Brands>>,
    collections?: Array<Partial<Collections>>,
    grids?: Array<Partial<Grids>>,
  },
};
