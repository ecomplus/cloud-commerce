import type {
  ResourceOpQuery,
  Endpoint,
  Config,
  ResponseBody,
  RequestBody,
} from './types';

// @ts-ignore
const env: { [key: string]: string } = (typeof window === 'object' && window)
  || (typeof process === 'object' && process && process.env)
  || {};

class ApiError extends Error {
  config: Config;
  response?: Response;
  statusCode?: number;
  isTimeout: boolean;
  constructor(config: Config, response?: Response, msg?: string, isTimeout: boolean = false) {
    super(response?.statusText || msg || 'Request error');
    this.config = config;
    this.response = response;
    this.statusCode = response?.status;
    this.isTimeout = isTimeout;
  }
}

const def = {
  middleware(config: Config) {
    const headers: Headers | Record<string, string> = { ...config.headers };
    if (config.accessToken) {
      // eslint-disable-next-line dot-notation
      headers['Authorization'] = `Bearer ${config.accessToken}`;
    } else if (config.authenticationId && config.apiKey) {
      const rawAuth = `${config.authenticationId}:${config.apiKey}`;
      const base64Auth = typeof Buffer === 'function'
        ? Buffer.from(rawAuth).toString('base64') : btoa(rawAuth);
      // eslint-disable-next-line dot-notation
      headers['Authorization'] = `Basic ${base64Auth}`;
    }
    let url = config.baseUrl || env.API_BASE_URL || 'https://ecomplus.io/v2';
    const { endpoint, params } = config;
    if (
      endpoint !== 'login'
      && endpoint !== 'authenticate'
      && endpoint !== 'ask-auth-callback'
      && endpoint !== 'check-username'
    ) {
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
    url += `/${endpoint}`;
    if (params) {
      if (typeof params === 'string') {
        url += `?${params}`;
      } else {
        // https://github.com/microsoft/TypeScript/issues/32951
        url += `?${new URLSearchParams(params as Record<string, string>)}`;
      }
    }
    return { url, headers };
  },
};

const setMiddleware = (middleware: typeof def.middleware) => {
  def.middleware = middleware;
};

const api = async <T extends Config & { body?: any, data?: any }>(config: T, retries = 0):
Promise<Response & {
  config: Config,
  data: ResponseBody<T>,
}> => {
  const { url, headers } = def.middleware(config);
  const {
    method,
    timeout = 20000,
    maxRetries = 3,
  } = config;
  const bodyObject = config.body || config.data;
  let body: string | undefined;
  if (bodyObject) {
    body = JSON.stringify(bodyObject);
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = body.length.toString();
  }

  const abortController = new AbortController();
  let isTimeout = false;
  const timer = setTimeout(() => {
    abortController.abort();
    isTimeout = true;
  }, timeout);
  let response: Response | undefined;
  try {
    response = await (config.fetch || fetch)(url, {
      method,
      headers,
      body,
      signal: abortController.signal,
    });
  } catch (err: any) {
    throw new ApiError(config, response, err.message, isTimeout);
  }
  clearTimeout(timer);

  if (response) {
    if (response.ok) {
      return {
        ...response,
        config,
        data: await response.json(),
      };
    }
    const { status } = response;
    if (maxRetries < retries && (status === 429 || status >= 500)) {
      const retryAfter = response.headers.get('retry-after');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          api(config, retries + 1).then(resolve).catch(reject);
        }, (retryAfter && parseInt(retryAfter, 10)) || 5000);
      });
    }
  }
  throw new ApiError(config, response);
};

type AbstractedConfig = Omit<Config, 'endpoint' | 'method'>;
type AbstractedAuthConfig = AbstractedConfig & { accessToken: string }
  | AbstractedConfig & { authenticationId: string, apiKey: string };

const get = <E extends Endpoint, C extends AbstractedConfig>(
  endpoint: E,
  config?: C,
): Promise<Response & {
  config: Config,
  data: ResponseBody<{ endpoint: E }>,
}> => api({ ...config, endpoint });

const post = <E extends Endpoint, C extends AbstractedAuthConfig>(
  endpoint: E,
  body: RequestBody<{ endpoint: E, method: 'post' }>,
  config: E extends 'login' | 'authenticate' ? AbstractedConfig : C,
) => api({
    ...config,
    method: 'post',
    endpoint,
    body,
  });

const put = <E extends Exclude<Endpoint, ResourceOpQuery>, C extends AbstractedAuthConfig>(
  endpoint: E,
  body: RequestBody<{ endpoint: E, method: 'put' }>,
  config: C,
) => api({
    ...config,
    method: 'put',
    endpoint,
    body,
  });

const patch = (endpoint: Endpoint, body: any, config: AbstractedAuthConfig) => api({
  ...config,
  method: 'patch',
  endpoint,
  body,
});

const del = (endpoint: Endpoint, config: AbstractedAuthConfig) => api({
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
