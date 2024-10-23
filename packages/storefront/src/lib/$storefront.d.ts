import type {
  Products,
  Categories,
  Brands,
  Collections,
  Grids,
} from '@cloudcommerce/api/types';
import type { SettingsContent } from '@@sf/content';
import type { CustomSharedData } from '@@sf/custom-shared-data';

export type StorefrontApiContext = {
  resource: 'products',
  doc: Products,
} | {
  resource: 'categories',
  doc: Categories,
} | {
  resource: 'brands',
  doc: Brands,
} | {
  resource: 'collections',
  doc: Collections,
};

export type $Storefront = {
  settings: Partial<SettingsContent>,
  url: URL,
  apiContext?: StorefrontApiContext,
  getSession: (sid?: string) => {
    url: URL,
    apiContext?: StorefrontApiContext,
  },
  data: Record<string, any>
    & {
      categories?: Array<Partial<Categories>>,
      brands?: Array<Partial<Brands>>,
      collections?: Array<Partial<Collections>>,
      grids?: Array<Partial<Grids>>,
    }
    & CustomSharedData,
};

export type Server$Storefront = $Storefront & {
  onLoad: (callback: (...args: any[]) => void) => void,
};
