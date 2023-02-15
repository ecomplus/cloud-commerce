import type { AstroGlobal } from 'astro';
import type { BaseConfig } from '@cloudcommerce/config';
import type { CategoriesList, BrandsList } from '@cloudcommerce/api/types';
import type { CMS, CmsSettings } from './cms';
import { EventEmitter } from 'node:events';
import api, { ApiError, ApiEndpoint } from '@cloudcommerce/api';
import _getConfig from '../../storefront.config.mjs';

type StorefrontConfig = {
  storeId: BaseConfig['storeId'],
  lang: BaseConfig['lang'],
  countryCode: BaseConfig['countryCode'],
  currency: BaseConfig['currency'],
  currencySymbol: BaseConfig['currencySymbol'],
  domain: CmsSettings['domain'],
  primaryColor: CmsSettings['primary_color'],
  secondaryColor: CmsSettings['secondary_color'],
  settings: CmsSettings,
  dirContent: string,
  // eslint-disable-next-line no-unused-vars
  cms: CMS,
};

const emitter = new EventEmitter();
const getConfig: () => StorefrontConfig = _getConfig;

declare global {
  // eslint-disable-next-line
  var api_prefetch_endpoints: ApiEndpoint[];
  // eslint-disable-next-line
  var storefront: {
    settings: Partial<CmsSettings>,
    onLoad: (callback: (...args: any[]) => void) => void,
  };
}
if (!globalThis.api_prefetch_endpoints) {
  globalThis.api_prefetch_endpoints = ['categories'];
}
if (!globalThis.storefront) {
  globalThis.storefront = {
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

const loadPageContext = async (Astro: AstroGlobal, {
  cmsCollection,
  apiPrefetchEndpoints = globalThis.api_prefetch_endpoints,
}: {
  cmsCollection?: string;
  apiPrefetchEndpoints?: ApiPrefetchEndpoints;
} = {}) => {
  const startedAt = Date.now();
  const urlPath = Astro.url.pathname;
  const isHomepage = urlPath === '/';
  const { slug } = Astro.params;
  const config = getConfig();
  globalThis.storefront.settings = config.settings;
  let cmsContent: Record<string, any> | undefined;
  let apiResource: string | undefined;
  let apiDoc: Record<string, any> | undefined;
  const apiState: {
    categories?: CategoriesList,
    brands?: BrandsList,
    [k: string]: Record<string, any>,
  } = {};
  const apiOptions = {
    fetch,
    isNoAuth: true,
  };
  const apiFetchings = [
    null, // fetch by slug
    ...apiPrefetchEndpoints.map((endpoint) => api.get(endpoint, apiOptions)),
  ];
  if (slug) {
    if (cmsCollection) {
      cmsContent = await config.cms(`${cmsCollection}/${slug}`);
    } else {
      apiFetchings[0] = api.get(`slugs/${slug}`, apiOptions);
    }
  }
  try {
    const [slugResponse, ...prefetchResponses] = await Promise.all(apiFetchings);
    if (slugResponse) {
      apiResource = slugResponse.data.resource;
      apiDoc = slugResponse.data.doc;
      apiState[`${apiResource}/${apiDoc._id}`] = apiDoc;
    }
    prefetchResponses.forEach(({ config: { endpoint }, data }) => {
      apiState[endpoint] = data.result || data;
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
  const pageContext = {
    ...config,
    isHomepage,
    cmsContent,
    apiResource,
    apiDoc,
    apiState,
  };
  emitter.emit('load', pageContext);
  return pageContext;
};

export default loadPageContext;

export {
  getConfig,
  loadPageContext,
};

type PageContext = Awaited<ReturnType<typeof loadPageContext>>;

export type {
  StorefrontConfig,
  CmsSettings,
  ApiPrefetchEndpoints,
  PageContext,
};
