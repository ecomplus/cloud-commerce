import type { Endpoint, Config, ResponseBody } from './types';

// @ts-ignore
const env: { [key: string]: string } = (typeof window === 'object' && window)
  || (typeof process === 'object' && process && process.env)
  || {};

const def = {
  middleware(config: Config) {
    let url = config.baseUrl || env.API_BASE_URL || 'https://ecomplus.io/v2';
    const storeId = config.storeId || env.ECOM_STORE_ID;
    if (!storeId) {
      throw new Error('`storeId` must be set in config or `ECOM_STORE_ID` env var');
    }
    url += `/:${storeId}`;
    const lang = config.lang || env.ECOM_LANG;
    if (lang) {
      url += `,lang:${lang}`;
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

const api = async <T extends Config>(config: T): Promise<Response & {
  config: Config,
  data: ResponseBody<T>,
}> => {
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

const get = (endpoint: Endpoint, config: Exclude<Config, 'method'>) => api({
  ...config,
  method: 'get',
  endpoint,
});

const post = (endpoint: Endpoint, config: Exclude<Config, 'method'>) => api({
  ...config,
  method: 'post',
  endpoint,
});

const put = (endpoint: Endpoint, config: Exclude<Config, 'method'>) => api({
  ...config,
  method: 'put',
  endpoint,
});

const patch = (endpoint: Endpoint, config: Exclude<Config, 'method'>) => api({
  ...config,
  method: 'patch',
  endpoint,
});

const del = (endpoint: Endpoint, config: Exclude<Config, 'method'>) => api({
  ...config,
  method: 'delete',
  endpoint,
});

api.get = get;
api.post = post;
api.put = put;
api.patch = patch;
api.del = del;
api.delete = del;

export default api;

export {
  setMiddleware,
  get,
  post,
  put,
  patch,
  del,
};
