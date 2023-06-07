import type { AstroGlobal } from 'astro';
import type { BaseConfig } from '@cloudcommerce/config';
import type { ApiError, ApiEndpoint } from '@cloudcommerce/api';
import type { CategoriesList, BrandsList } from '@cloudcommerce/api/types';
import type { ContentGetter, SettingsContent, PageContent } from './content';
import { EventEmitter } from 'node:events';
import api from '@cloudcommerce/api';
import _getConfig from '../../config/storefront.config.mjs';

type StorefrontConfig = {
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
  globalThis.$apiPrefetchEndpoints = ['categories'];
}
if (!globalThis.$storefront) {
  globalThis.$storefront = {
    settings: {},
    onLoad(callback: (...args: any[]) => void) {
      emitter.on('load', callback);
    },
  };
}

type ApiPrefetchEndpoints = Array<ApiEndpoint>;

const setResponseCache = (Astro: AstroGlobal, maxAge: number, sMaxAge?: number) => {
  const headerName = import.meta.env.PROD ? 'Cache-Control' : 'X-Cache-Control';
  let cacheControl = `public, max-age=${maxAge}, must-revalidate`;
  if (sMaxAge) {
    cacheControl += `, s-maxage=${sMaxAge}, stale-while-revalidate=604800`;
  }
  Astro.response.headers.set(headerName, cacheControl);
};

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
  let cmsContent: PageContent | Record<string, any> | null | undefined;
  let apiResource: 'products' | 'categories' | 'brands' | 'collections' | undefined;
  let apiDoc: Record<string, any> | undefined;
  const apiState: {
    categories?: CategoriesList,
    brands?: BrandsList,
    [k: string]: Record<string, any> | undefined,
  } = {};
  const apiFetchings = [
    null, // fetch by slug
    ...apiPrefetchEndpoints.map((endpoint) => api.get(endpoint)),
  ];
  if (isHomepage) {
    cmsContent = await config.getContent('pages/home');
  } else {
    const { slug } = Astro.params;
    if (slug) {
      if (contentCollection) {
        cmsContent = await config.getContent(`${contentCollection}/${slug}`);
      } else if (slug.startsWith('api/')) {
        const err: any = new Error('/api/* routes not implemented on SSR directly');
        Astro.response.status = 501;
        err.responseHTML = `<head></head><body>${err.message}</body>`;
        throw err;
      } else {
        apiFetchings[0] = api.get(`slugs/${slug}`);
      }
    }
  }
  try {
    const [slugResponse, ...prefetchResponses] = await Promise.all(apiFetchings);
    if (slugResponse) {
      apiResource = slugResponse.data.resource;
      apiDoc = slugResponse.data.doc;
      if (apiDoc) {
        apiState[`${apiResource}/${apiDoc._id}`] = apiDoc;
      }
    }
    prefetchResponses.forEach((response) => {
      if (response) {
        const { config: { endpoint }, data } = response;
        apiState[endpoint.replace(/\?.*$/, '')] = data.result || data;
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
        url=/fallback?status=${status}&url=${encodeURIComponent(urlPath)}"/>
      </head>
      <body></body>`;
    throw err;
  }
  Astro.response.headers.set('X-Load-Took', String(Date.now() - startedAt));
  if (urlPath === '/fallback') {
    setResponseCache(Astro, 3600, 86400);
  } else if (isHomepage) {
    setResponseCache(Astro, 180, 300);
  } else {
    setResponseCache(Astro, 120, 300);
  }
  if (apiDoc) {
    globalThis.$storefront.context = {
      resource: apiResource as Exclude<typeof apiResource, undefined>,
      doc: apiDoc as any,
      timestamp: Date.now(),
    };
  }
  const routeContext = {
    ...config,
    isHomepage,
    cmsContent,
    apiResource,
    apiDoc,
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

type RouteContext = Awaited<ReturnType<typeof loadRouteContext>>;

export type {
  StorefrontConfig,
  SettingsContent,
  ApiPrefetchEndpoints,
  RouteContext,
};
