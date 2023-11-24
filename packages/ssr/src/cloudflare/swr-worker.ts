// Compiled version at https://github.com/ecomplus/cloud-commerce/blob/main/packages/ssr/cloudflare/swr-worker.js
// Inspired by https://gist.github.com/wilsonpage/a4568d776ee6de188999afe6e2d2ee69

const HEADER_CACHE_CONTROL = 'Cache-Control';
const HEADER_SSR_TOOK = 'X-Load-Took';
const HEADER_STALE_AT = 'X-Edge-Stale-At';

interface ParsedCacheControl {
  'max-age'?: number;
  's-maxage'?: number;
  'stale-while-revalidate'?: number;
}

const resolveCacheControl = (response: Response) => {
  const cacheControl = response.headers.get(HEADER_CACHE_CONTROL);
  if (!cacheControl || !response.headers.get(HEADER_SSR_TOOK)) {
    return { cacheControl };
  }
  const parts = cacheControl.replace(/ +/g, '').split(',');
  const {
    'max-age': maxAge,
    's-maxage': sMaxAge,
    'stale-while-revalidate': staleMaxAge,
  } = parts.reduce((result, part) => {
    const [key, value] = part.split('=');
    result[key as 'max-age'] = Number(value) || 0;
    return result;
  }, {} as ParsedCacheControl);
  const cdnMaxAge = typeof sMaxAge === 'number' ? sMaxAge : maxAge;
  if (!cdnMaxAge || cdnMaxAge <= 1 || !staleMaxAge || staleMaxAge <= cdnMaxAge) {
    return { cacheControl };
  }
  const staleAt = Date.now() + (cdnMaxAge * 1000);
  return {
    cacheControl: `public, max-age=${maxAge}, must-revalidate`
      + `, s-maxage=${staleMaxAge}`,
    staleAt,
  };
};

const addHeaders = (response: Response, headers: Record<string, string | null>) => {
  const res = new Response(response.clone().body, {
    status: response.status,
    headers: response.headers,
  });
  Object.keys(headers).forEach((key) => {
    res.headers.delete(key);
    const value = headers[key];
    if (value) {
      res.headers.append(key, value);
    }
  });
  return res;
};

const toCacheRes = (response: Response, cacheControl?: string | null, staleAt?: number) => {
  if (cacheControl === undefined) {
    const parsedCacheControl = resolveCacheControl(response);
    cacheControl = parsedCacheControl.cacheControl;
    staleAt = parsedCacheControl.staleAt;
  }
  return addHeaders(response, {
    [HEADER_CACHE_CONTROL]: cacheControl,
    [HEADER_STALE_AT]: `${(staleAt || 0)}`,
    'set-cookie': null,
    'cf-cache-status': null,
    vary: null,
  });
};

const checkToKvCache = (newCacheRes: Response) => {
  return newCacheRes.status === 200
    && newCacheRes.headers.get('Content-Type')?.includes('text/html');
};

const putKvCache = async (kv: KVNamespace, kvKey: string, newCacheRes: Response) => {
  const newKvRes = new Response(newCacheRes.clone().body, { status: 200 });
  const body = await newKvRes.text();
  const headers: Record<string, string> = {};
  newCacheRes.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const kvValue = JSON.stringify({ body, headers });
  return kv.put(kvKey, kvValue, { expirationTtl: 3600 * 24 * 30 });
};

export type Env = Record<`OVERRIDE_${string}`, string | undefined> & {
  PERMA_CACHE: KVNamespace | undefined;
};

const swr = async (_rewritedReq: Request, env: Env, ctx: ExecutionContext) => {
  const _request = new Request(_rewritedReq.url.replace('/__swr/', '/'), _rewritedReq);
  const url = new URL(_request.url);
  const { hostname, pathname } = url;
  const hostOverride = env[`OVERRIDE_${hostname}`];
  if (hostOverride) {
    url.hostname = hostOverride;
  }
  const bypassEarly = () => {
    return !hostOverride
      ? fetch(_request)
      : fetch(new Request(url.href, _request));
  };
  if (_request.method !== 'GET') {
    return bypassEarly();
  }
  if (
    pathname === '/_image'
    || pathname.startsWith('/~')
    || pathname.startsWith('/_api/')
    || pathname.startsWith('/_feeds/')
  ) {
    return bypassEarly();
  }
  const [uri] = url.href.split('?', 2);
  const request = new Request(`${uri}?t=${Date.now()}`, _request);
  const v = 38;
  const cacheKey = new Request(`${uri}?v=${(v + 1)}`, {
    method: _request.method,
  });
  const kvKey = `${v}${uri.replace('https:/', '')}`;
  const kv = env.PERMA_CACHE;
  let cachedRes: Response | null | undefined;
  let edgeSource = '';
  try {
    const gettingCache = caches.default.match(cacheKey);
    let kvStoredRes: typeof cachedRes;
    const gettingKv = kv
      ? kv.get(kvKey, { type: 'json' }).then((value: any) => {
        if (value) {
          const { body, headers } = value as { body: string, headers: Record<string, string> };
          kvStoredRes = new Response(body, { headers, status: 200 });
          return kvStoredRes;
        }
        kvStoredRes = null;
        return undefined;
      })
      : Promise.resolve(undefined);
    cachedRes = await Promise.race([
      new Promise((resolve) => {
        gettingCache.then((fromCache) => {
          if (fromCache) {
            edgeSource = 'cache';
            resolve(fromCache);
          } else if (kvStoredRes !== undefined) {
            resolve(kvStoredRes);
          } else {
            gettingKv.finally(() => resolve(kvStoredRes));
          }
        });
      }) as Promise<typeof cachedRes>,
      new Promise((resolve) => {
        gettingKv.then((fromKv) => {
          if (fromKv) {
            edgeSource = 'kv';
            resolve(fromKv);
          } else {
            gettingCache.then((fromCache) => resolve(fromCache));
          }
        });
      }) as Promise<typeof cachedRes>,
    ]);
  } catch {
    //
  }
  let edgeState = 'miss';
  if (cachedRes) {
    const cachedStaleAt = Number(cachedRes.headers.get(HEADER_STALE_AT));
    if (!(cachedStaleAt > 0)) {
      edgeState = 'bypass';
    } else if (Date.now() > cachedStaleAt) {
      edgeState = 'stale';
      ctx.waitUntil((async () => {
        const newCacheRes = toCacheRes(await fetch(request));
        if (kv && checkToKvCache(newCacheRes)) {
          ctx.waitUntil(putKvCache(kv, kvKey, newCacheRes));
        }
        return caches.default.put(cacheKey, newCacheRes);
      })());
    } else {
      edgeState = 'fresh';
    }
  }
  const response = cachedRes || await fetch(request);
  const { cacheControl, staleAt } = resolveCacheControl(response);
  if (!cachedRes && response.ok) {
    const newCacheRes = toCacheRes(response, cacheControl, staleAt);
    ctx.waitUntil(caches.default.put(cacheKey, newCacheRes));
    if (kv && checkToKvCache(newCacheRes)) {
      ctx.waitUntil(putKvCache(kv, kvKey, newCacheRes));
    }
  }
  return addHeaders(response, {
    [HEADER_CACHE_CONTROL]: cacheControl,
    'x-edge-state': edgeState,
    'x-edge-src': edgeSource,
  });
};

export default {
  fetch: swr,
};
