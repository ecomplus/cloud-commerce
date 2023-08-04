/* eslint-disable vars-on-top, no-var */

import type { ApiEndpoint } from '@cloudcommerce/api';
import type { RouteContext } from '@@sf/ssr-context';
import type { $Storefront } from '@@sf/$storefront';

declare global {
  namespace App {
    interface Locals {
      routeContext: RouteContext,
    }
  }

  var $storefront: $Storefront & {
    onLoad: (callback: (...args: any[]) => void) => void,
  };
  var $apiPrefetchEndpoints: Array<ApiEndpoint | ':slug'>;
  var $storefrontSlimDocRegex: undefined | RegExp;
  // @TODO
  var $storefrontCmsHandler: undefined | any;
  var $storefrontThemeOptions: undefined | any;
  var $storefrontBrandColors: undefined | any;
  var $storefrontTailwindConfig: undefined | any;
}

export { };
