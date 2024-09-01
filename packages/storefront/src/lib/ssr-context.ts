import type { AsyncLocalStorage } from 'node:async_hooks';
import type { AstroGlobal } from 'astro';
import type { BaseConfig } from '@cloudcommerce/config';
import type { ApiError, ApiEndpoint } from '@cloudcommerce/api';
import type { CategoriesList, BrandsList } from '@cloudcommerce/api/types';
import type { ContentGetter, SettingsContent, PageContent } from '@@sf/content';
import type { StorefrontApiContext, Server$Storefront } from '@@sf/$storefront';
import { EventEmitter } from 'node:events';
import api from '@cloudcommerce/api';
import { asyncLocalStorage as _als } from '../../config/astro/node-middleware.mjs';
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

export const asyncLocalStorage = _als as AsyncLocalStorage<{ sid: string }>;

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
  fetchingApiContext?: Promise<any>,
  apiContext?: StorefrontApiContext,
  apiContextError?: ApiError;
  _timer?: NodeJS.Timeout,
}> = {};
// Internal global just to early clear session objects from memory
global.__sfSessions = sessions;
if (!globalThis.$storefront) {
  // @ts-expect-error: URL is retrived from `target.getSession().url`
  globalThis.$storefront = new Proxy({
    settings: {},
    data: {},
    url: undefined,
    getSession(sid?: string) {
      if (!sid) {
        sid = asyncLocalStorage.getStore()?.sid;
      }
      const {
        url,
        apiContext,
      } = (sid && sessions[sid]) || (global.__sfSession as typeof sessions[string]);
      return { url, apiContext };
    },
    onLoad(callback: () => void) {
      emitter.once('load', callback);
    },
  } as Server$Storefront, {
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
  const sid = asyncLocalStorage.getStore()?.sid || `${Date.now()}`;
  const url = new URL(Astro.url);
  url.searchParams.delete('__isrV');
  url.searchParams.delete('t');
  sessions[sid] = { url };
  global.__sfSession = sessions[sid];
  const startedAt = Date.now();
  let urlPath = url.pathname;
  const isPreview = urlPath.startsWith('/~preview');
  if (isPreview) {
    urlPath = urlPath.replace(/^\/~[^/]+\/?/, '/');
    const getQueryContent = (filename: string) => {
      const contentJson = url.searchParams.get(`content:${filename}`);
      if (typeof contentJson === 'string') {
        try {
          const content = JSON.parse(contentJson);
          return content;
        } catch {
          //
        }
      }
      return null;
    };
    global.$storefrontCmsHandler = ({ filename, loadLocal }) => {
      const content = getQueryContent(filename);
      if (filename === 'settings') return content || loadLocal();
      return new Promise((resolve) => {
        if (content) resolve(content);
        loadLocal().then(resolve);
      });
    };
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
  let cmsContent: PageContent & { $filename?: `${string}/${string}` } | null = {
    sections: [],
  };
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
  const apiContext: Partial<StorefrontApiContext> & {
    error: ApiError | null;
  } = {
    error: null,
  };
  const { slug } = Astro.params;
  let contentFilename: `${string}/${string}` | undefined;
  if (isHomepage) {
    contentFilename = 'pages/home';
  } else if (isSearchPage) {
    contentFilename = 'pages/search';
  } else if (slug && typeof slug === 'string') {
    if (contentCollection) {
      contentFilename = `${contentCollection}/${slug}`;
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
            const apiResource = apiContext.resource!;
            contentFilename = `pages/${apiResource}`;
            config.getContent(contentFilename)
              .then((_cmsContent) => {
                if (cmsContent && _cmsContent) {
                  Object.assign(cmsContent, _cmsContent);
                  cmsContent.$filename = contentFilename;
                }
              })
              .catch(console.warn);
            const apiDoc = apiContext.doc!;
            apiState[`${apiResource}/${apiDoc._id}`] = apiDoc;
            // @ts-expect-error: `apiDoc` not strictly satisfying `apiResource`
            sessions[sid].apiContext = {
              resource: apiResource,
              doc: apiDoc,
              timestamp: Date.now(),
            };
            sessions[sid]._timer = setTimeout(() => {
              // @ts-expect-error: mem clearing
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
              sessions[sid].apiContextError = err;
              resolve(null);
            }
          });
      }) as Promise<null>;
      sessions[sid].fetchingApiContext = fetchingApiContext;
      if (prefetchingsIndex > -1) {
        apiPrefetchings[prefetchingsIndex] = fetchingApiContext;
      }
    }
  }
  if (contentFilename) {
    cmsContent = await config.getContent(contentFilename);
    if (cmsContent) cmsContent.$filename = contentFilename;
  }
  try {
    if (contentFilename && !cmsContent) {
      const error = new Error('Content file does not exist by current slug') as
        Partial<ApiError> & { message: string };
      error.statusCode = 404;
      throw error;
    }
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
    const error: Partial<ApiError> & { message: string } = err;
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
        url=/~fallback?status=${status}&url=${encodeURIComponent(urlPath)}&__"/>
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
    setResponseCache(Astro, 180, 300);
  } else {
    setResponseCache(Astro, 120, 240);
  }
  if (
    url.searchParams.get('webcontainer') !== null
    || urlPath.startsWith('/admin/ide')
  ) {
    // https://webcontainers.io/guides/quickstart#cross-origin-isolation
    Astro.response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    Astro.response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    Astro.response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
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
