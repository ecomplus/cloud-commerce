/* eslint-disable vars-on-top, no-var */
/// <reference types="./config/astro/index.d.ts" />

import type { RouteContext } from '@@sf/ssr-context';
import type { Server$Storefront } from '@@sf/$storefront';

// See `ssr/utils`
type CachedRequestInit = RequestInit & {
  cacheKey?: string,
  maxAge?: number,
  timeout?: number,
};
type FetchAndCache = (url: URL | string, init?: CachedRequestInit) => Promise<any>;

declare global {
  namespace App {
    interface Locals {
      routeContext: RouteContext,
      assetsPrefix: string,
    }
  }

  var $ssrFetchAndCache: undefined | FetchAndCache;
  var $storefront: Server$Storefront;
  var $storefrontSlimDocRegex: undefined | RegExp;
  // @TODO
  var $storefrontCmsHandler: undefined | any;
  var $storefrontThemeOptions: undefined | any;
  var $storefrontBrandColors: undefined | any;
  var $storefrontTailwindConfig: undefined | any;
}

export { };
