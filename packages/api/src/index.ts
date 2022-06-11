type Resource = 'products'
  | 'categories'
  | 'brands'
  | 'collections'
  | 'grids'
  | 'carts'
  | 'orders'
  | 'customers'
  | 'stores'
  | 'applications';

type Endpoint = Resource | `${Resource}/${string}`;

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

type ReqOptions = {
  baseUrl?: string,
  storeId?: number,
  lang?: string,
  method: Method,
  endpoint: Endpoint,
  params?: Record<string, string | number>,
  headers?: Record<string, string>,
};

// @ts-ignore
const env: { [key: string]: string } = (typeof window === 'object' && window)
  || (typeof process === 'object' && process && process.env)
  || {};

const def = {
  middleware(options: ReqOptions) {
    let url = options.baseUrl || env.API_BASE_URL || 'https://ecomplus.io/v2';
    if (!url) {
      const storeId = options.storeId || env.ECOM_STORE_ID;
      if (!storeId) {
        throw new Error('`storeId` must be set in options or `ECOM_STORE_ID` env var');
      }
      url += `/:${storeId}`;
      const lang = options.lang || env.ECOM_LANG;
      if (lang) {
        url += `,lang:${lang}`;
      }
    }
    if (options.params) {
      if (typeof options.params === 'string') {
        url += `?${options.params}`;
      } else {
        // https://github.com/microsoft/TypeScript/issues/32951
        url += `?${new URLSearchParams(options.params as Record<string, string>)}`;
      }
    }
    return `${url}/${options.endpoint}`;
  },
};

// eslint-disable-next-line no-unused-vars
const setMiddleware = (middleware: typeof def.middleware) => {
  def.middleware = middleware;
};

const callApi = (options: ReqOptions) => {
  const url = def.middleware(options);
  const { method, headers } = options;
  return fetch(url, { method, headers });
};

const get = (endpoint: Endpoint, options: Exclude<ReqOptions, 'method'>) => callApi({
  ...options,
  method: 'get',
  endpoint,
});

const post = (endpoint: Endpoint, options: Exclude<ReqOptions, 'method'>) => callApi({
  ...options,
  method: 'post',
  endpoint,
});

const put = (endpoint: Endpoint, options: Exclude<ReqOptions, 'method'>) => callApi({
  ...options,
  method: 'put',
  endpoint,
});

const patch = (endpoint: Endpoint, options: Exclude<ReqOptions, 'method'>) => callApi({
  ...options,
  method: 'patch',
  endpoint,
});

const del = (endpoint: Endpoint, options: Exclude<ReqOptions, 'method'>) => callApi({
  ...options,
  method: 'delete',
  endpoint,
});

callApi.get = get;
callApi.post = post;
callApi.put = put;
callApi.patch = patch;
callApi.del = del;
callApi.delete = del;

export default callApi;

export {
  setMiddleware,
  get,
  post,
  put,
  patch,
  del,
};

export type {
  Resource,
  Endpoint,
  Method,
  ReqOptions,
};
