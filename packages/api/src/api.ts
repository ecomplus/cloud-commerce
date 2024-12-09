import type {
  ResourceOpQuery,
  Endpoint,
  Config,
  ResponseBody,
  RequestBody,
  ErrorBody,
} from '../types.d';

declare global {
  /* eslint-disable no-var, vars-on-top */
  // @ts-ignore
  var $apiMergeConfig: Partial<Config> | undefined;
  // eslint-disable-next-line
  var __apiCache: Record<string, {
    timestamp: number,
    res: Response & { data: any },
  }>;
  /* eslint-enable no-var */
}
if (!globalThis.__apiCache) {
  globalThis.__apiCache = {};
}

const _env = (
  (typeof process === 'object' && process?.env)
  || globalThis
) as Record<string, any>;

class ApiError extends Error {
  config: Config;
  url?: string;
  response?: Response & { data?: ErrorBody };
  statusCode?: number;
  headers?: Record<string, string>;
  data?: ErrorBody;
  retries?: number;
  isTimeout: boolean;
  constructor({
    config,
    url,
    response,
    msg,
    retries,
    isTimeout = false,
  }: {
    config: Config,
    url?: string,
    response?: ApiError['response'],
    msg?: string,
    retries?: number;
    isTimeout?: boolean,
  }) {
    if (response) {
      let errorMsg = response.statusText;
      const { data } = response;
      const errorCode = data?.error_code;
      if (errorCode) errorMsg += ` (${errorCode})`;
      if (retries) errorMsg += ` ${retries}a`;
      if (url) errorMsg += ` at ${url}`;
      super(errorMsg);
      this.data = data;
      this.statusCode = response.status;
      if (!errorCode) {
        this.headers = {};
        response.headers.forEach((value, name) => {
          this.headers![name] = value;
        });
      }
    } else {
      super(msg || 'Request error');
    }
    this.url = url;
    this.config = config;
    this.response = response;
    this.retries = retries;
    this.isTimeout = isTimeout;
  }
}

export const defaults = {
  middleware(config: Config) {
    const headers: Headers | Record<string, string> = { ...config.headers };
    if (!config.isNoAuth) {
      const accessToken = config.accessToken || _env.ECOM_ACCESS_TOKEN;
      if (accessToken) {
        // eslint-disable-next-line dot-notation
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else {
        const authenticationId = config.authenticationId || _env.ECOM_AUTHENTICATION_ID;
        const apiKey = config.apiKey || _env.ECOM_API_KEY;
        if (authenticationId && apiKey) {
          const rawAuth = `${authenticationId}:${apiKey}`;
          const base64Auth = typeof Buffer === 'function'
            ? Buffer.from(rawAuth).toString('base64') : btoa(rawAuth);
          // eslint-disable-next-line dot-notation
          headers['Authorization'] = `Basic ${base64Auth}`;
        }
      }
    }
    let url = config.baseUrl || _env.API_BASE_URL || 'https://ecomplus.io/v2';
    const { endpoint, params } = config;
    if (
      endpoint !== 'login'
      && endpoint !== 'authenticate'
      && endpoint !== 'ask-auth-callback'
      && endpoint !== 'check-username'
    ) {
      const storeId = config.storeId || _env.ECOM_STORE_ID;
      if (!storeId) {
        throw new Error('`storeId` must be set in config or `ECOM_STORE_ID` env var');
      }
      url += `/:${storeId}`;
      const lang = config.lang || _env.ECOM_LANG;
      if (lang) {
        url += `,lang:${lang}`;
      }
    }
    url += `/${endpoint}`;
    if (typeof params === 'string') {
      url += `?${params}`;
    } else {
      const paramsObj: Exclude<typeof params, string> = params || {};
      (['fields', 'sort'] as const)
        .forEach((param) => {
          const value = config[param];
          if (value && !paramsObj[param]) {
            paramsObj[param] = value.join(',');
          }
        });
      (['limit', 'offset', 'count', 'buckets', 'concise', 'verbose'] as const)
        .forEach((param) => {
          const value = config[param];
          if (value && !paramsObj[param]) {
            paramsObj[param] = value;
          }
        });
      if (Object.keys(paramsObj).length) {
        let querystring = '';
        Object.keys(paramsObj).forEach((key) => {
          const values = paramsObj[key];
          if (Array.isArray(values)) {
            values.forEach((value: string | number) => {
              querystring += `&${key}=${encodeURIComponent(value)}`;
            });
          } else if (values !== undefined) {
            querystring += `&${key}=${encodeURIComponent(values)}`;
          }
        });
        url += `?${querystring.substring(1)}`;
      }
    }
    return { url, headers };
  },
};

export const setMiddleware = (middleware: typeof defaults.middleware) => {
  defaults.middleware = middleware;
};

const api = async <T extends Config & { body?: any, data?: any }>(
  requestConfig: T,
  retries = 0,
): Promise<Response & {
  config: Config,
  data: ResponseBody<T>,
}> => {
  const config = globalThis.$apiMergeConfig
    ? { ...globalThis.$apiMergeConfig, ...requestConfig }
    : requestConfig;
  const { url, headers } = defaults.middleware(config);
  const method = config.method?.toUpperCase() || 'GET';
  const {
    timeout = 20000,
    maxRetries = 3,
    cacheMaxAge = Number(_env.API_CACHE_MAX_AGE) || 120000 /* 2 minutes */,
  } = config;
  const canCache = method === 'GET' && config.canCache;
  let cacheKey: string | undefined;
  if (canCache) {
    cacheKey = `${url}${JSON.stringify(headers)}`;
    const cached = globalThis.__apiCache[cacheKey];
    if (cached && Date.now() - cached.timestamp <= cacheMaxAge) {
      return { ...cached.res, config };
    }
  }
  const bodyInput = config.body !== undefined ? config.body : config.data;
  let body: string | undefined;
  if (bodyInput !== undefined) {
    body = JSON.stringify(bodyInput);
    headers['Content-Type'] = 'application/json';
  }

  const abortController = new AbortController();
  let isTimeout = false;
  const timer = setTimeout(() => {
    abortController.abort();
    isTimeout = true;
  }, timeout);
  let response: Response & { data?: any } | undefined;
  try {
    response = await (config.fetch || fetch)(url, {
      method,
      headers,
      body,
      signal: abortController.signal,
    });
  } catch (err: any) {
    let msg = err.message;
    if (err.cause) {
      msg += ` - ${err.cause}`;
    }
    throw new ApiError({
      config,
      url,
      response,
      msg,
      retries,
      isTimeout,
    });
  }
  clearTimeout(timer);

  if (response) {
    if (response.ok) {
      const res = response as Response & { data: any, config: Config };
      res.data = response.status !== 204 ? await response.json() : null;
      if (canCache && cacheKey) {
        globalThis.__apiCache[cacheKey] = {
          timestamp: Date.now(),
          res: res as Response & { data: any },
        };
      }
      res.config = config;
      return res;
    }
    const { status } = response;
    if (maxRetries > retries && (status === 429 || status >= 500)) {
      const retryAfter = response.headers.get('retry-after');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          api(requestConfig, retries + 1).then(resolve).catch(reject);
        }, (retryAfter && parseInt(retryAfter, 10) * 1000) || 5000);
      });
    }
  }
  try {
    response.data = await response?.json() as ErrorBody;
  } catch {
    //
  }
  throw new ApiError({
    config,
    url,
    response,
    retries,
  });
};

type AbstractedConfig = Omit<Config, 'endpoint' | 'method'>;

const get = <E extends Endpoint, C extends AbstractedConfig>(
  endpoint: E,
  config?: C,
): Promise<Response & {
  config: Config,
  data: ResponseBody<C & { endpoint: E }>,
}> => {
  // @ts-ignore
  return api({ ...config, endpoint });
};

const post = <E extends Endpoint, C extends AbstractedConfig>(
  endpoint: E,
  body: RequestBody<{ endpoint: E, method: 'post' }>,
  config?: E extends 'login' | 'authenticate' ? AbstractedConfig : C,
) => {
  return api({
    ...config,
    method: 'post',
    endpoint,
    body,
  });
};

const put = <E extends Exclude<Endpoint, ResourceOpQuery>, C extends AbstractedConfig>(
  endpoint: E,
  body: RequestBody<{ endpoint: E, method: 'put' }>,
  config?: C,
) => {
  return api({
    ...config,
    method: 'put',
    endpoint,
    body,
  });
};

const patch = <E extends Endpoint, C extends AbstractedConfig>(
  endpoint: E,
  body: RequestBody<{ endpoint: E, method: 'patch' }>,
  config?: C,
) => {
  return api({
    ...config,
    method: 'patch',
    endpoint,
    body,
  });
};

const del = (endpoint: Endpoint, config?: AbstractedConfig) => api({
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
  get,
  post,
  put,
  patch,
  del,
  ApiError,
};

export type ApiEndpoint = Endpoint;

export type ApiConfig = Config;

export type ApiErrorBody = ErrorBody;
