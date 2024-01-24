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
  response?: Response & { data?: ErrorBody };
  statusCode?: number;
  data?: ErrorBody;
  isTimeout: boolean;
  constructor(
    config: Config,
    response?: ApiError['response'],
    msg?: string,
    isTimeout: boolean = false,
  ) {
    if (response) {
      super(response.statusText);
      this.data = response.data;
      this.statusCode = response.status;
    } else {
      super(msg || 'Request error');
    }
    this.config = config;
    this.response = response;
    this.isTimeout = isTimeout;
  }
}

const def = {
  middleware(config: Config) {
    const headers: Headers | Record<string, string> = { ...config.headers };
    if (!config.isNoAuth) {
      if (config.accessToken) {
        // eslint-disable-next-line dot-notation
        headers['Authorization'] = `Bearer ${config.accessToken}`;
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
        const searchParams = new URLSearchParams();
        Object.keys(paramsObj).forEach((key) => {
          const values = paramsObj[key];
          if (Array.isArray(values)) {
            values.forEach((value: string | number) => {
              // https://github.com/microsoft/TypeScript/issues/32951
              searchParams.append(key, value as string);
            });
          } else if (values !== undefined) {
            searchParams.append(key, values as string);
          }
        });
        url += `?${searchParams.toString()}`;
      }
    }
    return { url, headers };
  },
};

const setMiddleware = (middleware: typeof def.middleware) => {
  def.middleware = middleware;
};

const api = async <T extends Config & { body?: any, data?: any }>(
  requestConfig: T,
  _retries = 0,
): Promise<Response & {
  config: Config,
  data: ResponseBody<T>,
}> => {
  const config = globalThis.$apiMergeConfig
    ? { ...globalThis.$apiMergeConfig, ...requestConfig }
    : requestConfig;
  const { url, headers } = def.middleware(config);
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
  const bodyObject = config.body || config.data;
  let body: string | undefined;
  if (bodyObject) {
    body = JSON.stringify(bodyObject);
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
    throw new ApiError(config, response, msg, isTimeout);
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
    if (maxRetries < _retries && (status === 429 || status >= 500)) {
      const retryAfter = response.headers.get('retry-after');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          api(requestConfig, _retries + 1).then(resolve).catch(reject);
        }, (retryAfter && parseInt(retryAfter, 10) * 1000) || 5000);
      });
    }
  }
  try {
    response.data = await response?.json() as ErrorBody;
  } catch (e) {
    //
  }
  throw new ApiError(config, response);
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
  setMiddleware,
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
