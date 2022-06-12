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

type Config = {
  baseUrl?: string,
  storeId?: number,
  lang?: string,
  method: Method,
  endpoint: Endpoint,
  params?: Record<string, string | number>,
  headers?: Record<string, string>,
  timeout?: number,
};

// @ts-ignore
const env: { [key: string]: string } = (typeof window === 'object' && window)
  || (typeof process === 'object' && process && process.env)
  || {};

const def = {
  middleware(config: Config) {
    let url = config.baseUrl || env.API_BASE_URL || 'https://ecomplus.io/v2';
    if (!url) {
      const storeId = config.storeId || env.ECOM_STORE_ID;
      if (!storeId) {
        throw new Error('`storeId` must be set in config or `ECOM_STORE_ID` env var');
      }
      url += `/:${storeId}`;
      const lang = config.lang || env.ECOM_LANG;
      if (lang) {
        url += `,lang:${lang}`;
      }
    }
    if (config.params) {
      if (typeof config.params === 'string') {
        url += `?${config.params}`;
      } else {
        // https://github.com/microsoft/TypeScript/issues/32951
        url += `?${new URLSearchParams(config.params as Record<string, string>)}`;
      }
    }
    return `${url}/${config.endpoint}`;
  },
};

// eslint-disable-next-line no-unused-vars
const setMiddleware = (middleware: typeof def.middleware) => {
  def.middleware = middleware;
};

const callApi = async (config: Config) => {
  const url = def.middleware(config);
  const { method, headers, timeout = 20000 } = config;
  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort(), timeout);
  const response = await fetch(url, {
    method,
    headers,
    signal: abortController.signal,
  });
  clearTimeout(timer);
  if (response.ok) {
    return {
      ...response,
      config,
      data: await response.json(),
    };
  }
  const error: any = new Error(response.statusText);
  error.config = config;
  error.response = response;
  throw error;
};

const get = (endpoint: Endpoint, config: Exclude<Config, 'method'>) => callApi({
  ...config,
  method: 'get',
  endpoint,
});

const post = (endpoint: Endpoint, config: Exclude<Config, 'method'>) => callApi({
  ...config,
  method: 'post',
  endpoint,
});

const put = (endpoint: Endpoint, config: Exclude<Config, 'method'>) => callApi({
  ...config,
  method: 'put',
  endpoint,
});

const patch = (endpoint: Endpoint, config: Exclude<Config, 'method'>) => callApi({
  ...config,
  method: 'patch',
  endpoint,
});

const del = (endpoint: Endpoint, config: Exclude<Config, 'method'>) => callApi({
  ...config,
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
  Config,
};
