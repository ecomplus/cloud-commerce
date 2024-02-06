import type { AstroGlobal } from 'astro';
import type { BaseConfig } from '@cloudcommerce/config';
import type { ApiError, ApiEndpoint } from '@cloudcommerce/api';
import type { ResourceId, CategoriesList, BrandsList } from '@cloudcommerce/api/types';
import type { ContentGetter, SettingsContent, PageContent } from '@@sf/content';
import type { StorefrontApiContext } from '@@sf/$storefront';
import { EventEmitter } from 'node:events';
import { inject, getCurrentInstance } from 'vue';
import api from '@cloudcommerce/api';
import _getConfig from '../../config/storefront.config.mjs';
import { termify } from '../helpers/sf-utils';

export type StorefrontConfig = {
  storeId: BaseConfig['storeId'],
  lang: BaseConfig['lang'],
  countryCode: BaseConfig['countryCode'],
  currency: BaseConfig['currency'],
  currencySymbol: BaseConfig['currencySymbol'],
  domain: SettingsContent['domain'],
  primaryColor: SettingsContent['primaryColor'],
  secondaryColor: SettingsContent['secondaryColor'],
  settings: SettingsContent,
  getContent: ContentGetter,
};

const emitter = new EventEmitter();
const getConfig: () => StorefrontConfig = _getConfig;

if (!globalThis.$apiMergeConfig) {
  globalThis.$apiMergeConfig = {
    isNoAuth: true,
    canCache: true,
  };
}
declare global {
  /* eslint-disable no-var, vars-on-top */
  var $apiPrefetchEndpoints: Array<ApiEndpoint | ':slug'>;
  /* eslint-enable no-var */
}
if (!globalThis.$apiPrefetchEndpoints) {
  globalThis.$apiPrefetchEndpoints = [];
}
const sessions: Record<string, {
  url: URL,
  apiContext?: StorefrontApiContext,
  _timer?: NodeJS.Timeout,
}> = {};
// Internal global just to early clear session objects from memory
global.__sfSessions = sessions;
if (!globalThis.$storefront) {
  globalThis.$storefront = new Proxy({
    settings: {},
    data: {},
    url: undefined as any,
    getSession(sid?: string) {
      if (!sid && !!getCurrentInstance()) {
        sid = inject('sid');
      }
      const {
        url,
        apiContext,
      } = (sid && sessions[sid]) || (global.__sfSession as typeof sessions[string]);
      return { url, apiContext };
    },
    onLoad(callback: (...args: any[]) => void) {
      emitter.once('load', callback);
    },
  }, {
    get(target, prop) {
      if (prop === 'apiContext') {
        return target.getSession().apiContext;
      }
      if (prop === 'url') {
        return target.getSession().url;
      }
      return target[prop];
    },
  });
}

declare global {
  /* eslint-disable no-var, vars-on-top */
  var $storefrontCacheController: undefined
    | ((Astro: AstroGlobal, maxAge: number, sMaxAge?: number) => string | null);
  /* eslint-enable no-var */
}
const setResponseCache = (Astro: AstroGlobal, maxAge: number, sMaxAge?: number) => {
  const headerName = import.meta.env.PROD ? 'Cache-Control' : 'X-Cache-Control';
  let cacheControl: string | null = null;
  if (globalThis.$storefrontCacheController) {
    cacheControl = globalThis.$storefrontCacheController(Astro, maxAge, sMaxAge);
  } else {
    cacheControl = `public, max-age=${maxAge}, must-revalidate`;
    if (sMaxAge) cacheControl += `, s-maxage=${sMaxAge}`;
    if (sMaxAge || maxAge >= 60) cacheControl += `, stale-while-revalidate=604800`;
  }
  if (cacheControl) {
    Astro.response.headers.set(headerName, cacheControl);
  }
};

export type ApiPrefetchEndpoints = Array<ApiEndpoint | ':slug'>;

const loadRouteContext = async (
  Astro: AstroGlobal | Readonly<AstroGlobal<any, any, any>>,
  {
    contentCollection,
    apiPrefetchEndpoints = globalThis.$apiPrefetchEndpoints,
  }: {
    contentCollection?: string;
    apiPrefetchEndpoints?: ApiPrefetchEndpoints;
  } = {},
) => {
  const sid = `${Date.now() + Math.random()}`;
  sessions[sid] = { url: Astro.url };
  global.__sfSession = sessions[sid];
  const startedAt = Date.now();
  let urlPath = Astro.url.pathname;
  const isPreview = urlPath.startsWith('/~preview');
  if (isPreview) {
    urlPath = urlPath.replace('/~preview', '');
  }
  const isHomepage = urlPath === '/';
  const isSearchPage = !isHomepage && (urlPath.startsWith('/s/') || urlPath === '/s');
  let searchPageTerm: string | undefined;
  if (isSearchPage) {
    const pathTerm = urlPath.split('/')[2];
    if (typeof pathTerm === 'string') {
      searchPageTerm = termify(decodeURIComponent(pathTerm));
    }
  }
  const config = getConfig();
  globalThis.$storefront.settings = config.settings;
  let cmsContent: PageContent | null = { sections: [] };
  const apiState: {
    categories?: CategoriesList,
    brands?: BrandsList,
    [k: string]: Record<string, any> | undefined,
  } = {};
  const apiPrefetchings: Array<ReturnType<typeof api.get> | Promise<null> | null> = [
    ...apiPrefetchEndpoints.map((endpoint) => {
      if (endpoint === ':slug') return null; // fetch by slug
      return api.get(endpoint);
    }),
  ];
  let fetchingApiContext: typeof apiPrefetchings[number] = null;
  const apiContext: {
    resource?: 'products' | 'categories' | 'brands' | 'collections';
    doc?: Record<string, any> & {
      _id: ResourceId;
      store_id: number;
      created_at: string;
      updated_at: string;
    };
    error: ApiError | null;
  } = {
    error: null,
  };
  const { slug } = Astro.params;
  if (isHomepage) {
    cmsContent = await config.getContent('pages/home');
  } else if (isSearchPage) {
    cmsContent = await config.getContent('pages/search');
  } else if (slug && typeof slug === 'string') {
    if (contentCollection) {
      cmsContent = await config.getContent(`${contentCollection}/${slug}`);
    } else if (slug.startsWith('_api/') || slug === '_analytics') {
      const err: any = new Error(`/${slug} route not implemented on SSR directly`);
      Astro.response.status = 501;
      err.responseHTML = `<head></head><body>${err.message}</body>`;
      throw err;
    } else {
      const prefetchingsIndex = apiPrefetchings.findIndex((pr) => pr === null);
      fetchingApiContext = new Promise((resolve, reject) => {
        api.get(`slugs/${slug}`)
          .then((response) => {
            Object.assign(apiContext, response.data);
            const apiResource = apiContext.resource as
              Exclude<typeof apiContext.resource, undefined>;
            config.getContent(`pages/${apiResource}`)
              .then((_cmsContent) => {
                if (cmsContent && _cmsContent) {
                  Object.assign(cmsContent, _cmsContent);
                }
              })
              .catch(console.warn);
            const apiDoc = apiContext.doc as Record<string, any>;
            apiState[`${apiResource}/${apiDoc._id}`] = apiDoc;
            sessions[sid].apiContext = {
              resource: apiResource,
              doc: apiDoc as any,
              timestamp: Date.now(),
            };
            sessions[sid]._timer = setTimeout(() => {
              // @ts-ignore
              sessions[sid] = null;
              delete sessions[sid];
            }, 6000);
            resolve(null);
          })
          .catch((err: ApiError) => {
            if (prefetchingsIndex > -1) {
              reject(err);
            } else {
              apiContext.error = err;
              resolve(null);
            }
          });
      }) as Promise<null>;
      if (prefetchingsIndex > -1) {
        apiPrefetchings[prefetchingsIndex] = fetchingApiContext;
      }
    }
  }
  try {
    (await Promise.all(apiPrefetchings)).forEach((response) => {
      if (response) {
        const { config: { endpoint }, data } = response;
        const apiStateKey = endpoint.replace(/\?.*$/, '');
        if (!apiState[apiStateKey]) {
          apiState[apiStateKey] = data.result || data;
        }
      } else if (slug && apiContext.doc) {
        apiState[`slugs/${slug}`] = apiContext;
      }
    });
  } catch (err: any) {
    const error: ApiError = err;
    const status = error.statusCode || 500;
    if (status === 404) {
      if (urlPath.endsWith('/')) {
        err.redirectUrl = urlPath.slice(0, -1);
        err.astroResponse = Astro.redirect(err.redirectUrl);
        throw err;
      }
      setResponseCache(Astro, 120, 300);
    } else {
      console.error(error);
      setResponseCache(Astro, 30);
      Astro.response.headers.set('X-SSR-Error', error.message);
    }
    Astro.response.status = status;
    err.responseHTML = `<head>
      <meta http-equiv="refresh" content="0;
        url=/~fallback?status=${status}&url=${encodeURIComponent(urlPath)}"/>
      </head>
      <body></body>`;
    throw err;
  }
  Astro.response.headers.set('X-Load-Took', String(Date.now() - startedAt));
  if (import.meta.env.PROD) {
    const { assetsPrefix } = config.settings;
    if (assetsPrefix && assetsPrefix.startsWith('https://')) {
      const cdnURL = assetsPrefix.replace(/(https:\/\/[^/]+).*/, '$1');
      Astro.response.headers.set('Link', `<${cdnURL}/>; rel=preconnect`);
    }
    Astro.locals.assetsPrefix = assetsPrefix || '';
  } else {
    Astro.locals.assetsPrefix = '';
  }
  if (isPreview) {
    setResponseCache(Astro, 0);
  } else if (urlPath === '/~fallback') {
    setResponseCache(Astro, 3600, 86400);
  } else if (isHomepage) {
    setResponseCache(Astro, 180);
  } else {
    setResponseCache(Astro, 120, 180);
  }
  const routeContext = {
    ...config,
    isHomepage,
    isSearchPage,
    searchPageTerm,
    cmsContent,
    fetchingApiContext,
    apiContext,
    apiState,
    isPreview,
    sid,
    // Astro,
  };
  Astro.locals.routeContext = routeContext;
  Astro.cookies.set('sid', sid);
  Astro.response.headers.set('X-SId', sid);
  emitter.emit('load', { ...config, apiState });
  globalThis.__sfIds = {}; // see helpers/sf-utils.ts
  return routeContext;
};

export {
  getConfig,
  loadRouteContext,
};

export type RouteContext = Awaited<ReturnType<typeof loadRouteContext>>;
