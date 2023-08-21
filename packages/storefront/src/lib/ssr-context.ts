import type { AstroGlobal } from 'astro';
import type { BaseConfig } from '@cloudcommerce/config';
import type { ApiError, ApiEndpoint } from '@cloudcommerce/api';
import type { CategoriesList, BrandsList } from '@cloudcommerce/api/types';
import type { ContentGetter, SettingsContent, PageContent } from '@@sf/content';
import { EventEmitter } from 'node:events';
import api from '@cloudcommerce/api';
import _getConfig from '../../config/storefront.config.mjs';

export type StorefrontConfig = {
  storeId: BaseConfig['storeId'],
  lang: BaseConfig['lang'],
  countryCode: BaseConfig['countryCode'],
  currency: BaseConfig['currency'],
  currencySymbol: BaseConfig['currencySymbol'],
  domain: SettingsContent['domain'],
  primaryColor: SettingsContent['primary_color'],
  secondaryColor: SettingsContent['secondary_color'],
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
if (!globalThis.$apiPrefetchEndpoints) {
  globalThis.$apiPrefetchEndpoints = [];
}
if (!globalThis.$storefront) {
  globalThis.$storefront = {
    settings: {},
    onLoad(callback: (...args: any[]) => void) {
      emitter.once('load', callback);
    },
    data: {},
  };
}

const setResponseCache = (Astro: AstroGlobal, maxAge: number, sMaxAge?: number) => {
  const headerName = import.meta.env.PROD ? 'Cache-Control' : 'X-Cache-Control';
  let cacheControl = `public, max-age=${maxAge}, must-revalidate`;
  if (sMaxAge) {
    cacheControl += `, s-maxage=${sMaxAge}, stale-while-revalidate=604800`;
  }
  Astro.response.headers.set(headerName, cacheControl);
};

export type ApiPrefetchEndpoints = Array<ApiEndpoint | ':slug'>;

const loadRouteContext = async (Astro: Readonly<AstroGlobal>, {
  contentCollection,
  apiPrefetchEndpoints = globalThis.$apiPrefetchEndpoints,
}: {
  contentCollection?: string;
  apiPrefetchEndpoints?: ApiPrefetchEndpoints;
} = {}) => {
  const startedAt = Date.now();
  let urlPath = Astro.url.pathname;
  const isPreview = urlPath.startsWith('/~preview');
  if (isPreview) {
    urlPath = urlPath.replace('/~preview', '');
  }
  const isHomepage = urlPath === '/';
  const config = getConfig();
  globalThis.$storefront.settings = config.settings;
  let cmsContent: PageContent | null | undefined;
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
    resource?: 'products' | 'categories' | 'brands' | 'collections',
    doc?: Record<string, any>,
    error: ApiError | null,
  } = {
    error: null,
  };
  const { slug } = Astro.params;
  if (isHomepage) {
    cmsContent = await config.getContent('pages/home');
  } else if (slug) {
    if (contentCollection) {
      cmsContent = await config.getContent(`${contentCollection}/${slug}`);
    } else if (slug.startsWith('api/')) {
      const err: any = new Error('/api/* routes not implemented on SSR directly');
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
            const apiDoc = apiContext.doc as Record<string, any>;
            apiState[`${apiResource}/${apiDoc._id}`] = apiDoc;
            globalThis.$storefront.apiContext = {
              resource: apiResource,
              doc: apiDoc as any,
              timestamp: Date.now(),
            };
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
  if (urlPath === '/~fallback') {
    setResponseCache(Astro, 3600, 86400);
  } else if (isHomepage) {
    setResponseCache(Astro, 180, 300);
  } else {
    setResponseCache(Astro, 120, 300);
  }
  const routeContext = {
    ...config,
    isHomepage,
    cmsContent,
    fetchingApiContext,
    apiContext,
    apiState,
    isPreview,
  };
  Astro.locals.routeContext = routeContext;
  emitter.emit('load', routeContext);
  return routeContext;
};

export default loadRouteContext;

export {
  getConfig,
  loadRouteContext,
};

export type RouteContext = Awaited<ReturnType<typeof loadRouteContext>>;
