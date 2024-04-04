/* eslint-disable vars-on-top, no-var */
/// <reference types="./config/astro/index.d.ts" />

import type { RouteContext } from '@@sf/ssr-context';
import type { Server$Storefront } from '@@sf/$storefront';

declare global {
  namespace App {
    interface Locals {
      routeContext: RouteContext,
      assetsPrefix: string,
    }
  }

  var $storefront: Server$Storefront;
  var $storefrontSlimDocRegex: undefined | RegExp;
  // @TODO
  var $storefrontCmsHandler: undefined | any;
  var $storefrontThemeOptions: undefined | any;
  var $storefrontBrandColors: undefined | any;
  var $storefrontTailwindConfig: undefined | any;
}

export { };
