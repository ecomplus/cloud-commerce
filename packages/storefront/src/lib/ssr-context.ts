import type { AstroGlobal } from 'astro';
import type { BaseConfig } from '@cloudcommerce/config';
import api, { ApiError, ApiEndpoint } from '@cloudcommerce/api';
import _getConfig from '../../storefront.config.mjs';
import settings from '../../content/settings.json';

type CmsSettings = typeof settings;

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
  cms: (filename: string) => Record<string, any> | Array<string>,
};

const getConfig: () => StorefrontConfig = _getConfig;

if (!globalThis.api_prefetch_endpoints) {
  globalThis.api_prefetch_endpoints = ['categories'];
}

type ApiPrefetchEndpoints = Array<ApiEndpoint>;

const loadPageContext = async (
  Astro: AstroGlobal,
  cmsCollection?: string,
  apiPrefetchEndpoints: ApiPrefetchEndpoints = globalThis.api_prefetch_endpoints,
) => {
  const { slug } = Astro.params;
  const config = getConfig();
  let cmsContent: Record<string, any> | undefined;
  let apiResource: string | undefined;
  let apiDoc: Record<string, any> | undefined;
  const apiState: { [k: string]: Record<string, any> } = {};
  if (slug) {
    if (cmsCollection) {
      cmsContent = config.cms(`${cmsCollection}/${slug}`);
    } else {
      const apiOptions = {
        fetch,
        isNoAuth: true,
      };
      const apiFetchings = [
        api.get(`slugs/${slug}`, apiOptions),
        ...apiPrefetchEndpoints.map((endpoint) => api.get(endpoint, apiOptions)),
      ];
      try {
        const [slugResponse, ...prefetchResponses] = await Promise.all(apiFetchings);
        apiResource = slugResponse.data.resource;
        apiDoc = slugResponse.data.doc;
        apiState[`${apiResource}/${apiDoc._id}`] = apiDoc;
        prefetchResponses.forEach(({ config: { endpoint }, data }) => {
          apiState[endpoint] = data;
        });
      } catch (e: any) {
        const error: ApiError = e;
        let toUrl: string;
        if (error.statusCode === 404) {
          toUrl = '/404';
          Astro.response.headers.set('Cache-Control', 'public, max-age=120');
        } else {
          console.error(error);
          toUrl = '/500';
          Astro.response.headers.set('X-SSR-Error', error.stack);
        }
        const err: any = new Error(`Load page context failed: ${error.message}`);
        err.originalError = error;
        err.redirectUrl = `${toUrl}?url=${encodeURIComponent(Astro.url.pathname)}`;
        err.astroResponse = Astro.redirect(err.redirectUrl);
        throw err;
      }
    }
  }
  return {
    ...config,
    cmsContent,
    apiResource,
    apiDoc,
    apiState,
  };
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
