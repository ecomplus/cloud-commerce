/* eslint-disable vars-on-top, no-var */

import type { ApiEndpoint } from '@cloudcommerce/api';
import type {
  ProductSet,
  CategorySet,
  BrandSet,
  CollectionSet,
} from '@cloudcommerce/api/types';
import type { SettingsContent } from './src/lib/content';

declare global {
  var $storefront: {
    settings: Partial<SettingsContent>,
    context?: {
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
    onLoad: (callback: (...args: any[]) => void) => void,
  };
  var $apiPrefetchEndpoints: ApiEndpoint[];
  var $storefrontSlimDocRegex: undefined | RegExp;
  // @TODO
  var $storefrontCmsHandler: undefined | any;
  var $storefrontThemeOptions: undefined | any;
  var $storefrontBrandColors: undefined | any;
  var $storefrontTailwindConfig: undefined | any;
}

export { };
