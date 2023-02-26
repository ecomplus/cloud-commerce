import type { ApiEndpoint } from '@cloudcommerce/api';
import type {
  ProductSet,
  CategorySet,
  BrandSet,
  CollectionSet,
} from '@cloudcommerce/api/types';
import type { CmsSettings } from './src/lib/cms';

declare global {
  // eslint-disable-next-line
  var storefront: {
    settings: Partial<CmsSettings>,
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
  // eslint-disable-next-line
  var api_prefetch_endpoints: undefined | ApiEndpoint[];
  // eslint-disable-next-line
  var storefront_slim_doc_regex: undefined | RegExp;
}

export { };
