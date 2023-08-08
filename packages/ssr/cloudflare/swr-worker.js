// Compiled version at https://github.com/ecomplus/cloud-commerce/blob/main/packages/ssr/cloudflare/swr-worker.js
// Inspired by https://gist.github.com/wilsonpage/a4568d776ee6de188999afe6e2d2ee69
const HEADER_CACHE_CONTROL = 'Cache-Control';
const HEADER_SSR_TOOK = 'X-Load-Took';
const HEADER_STALE_AT = 'X-Edge-Stale-At';
const resolveCacheControl = (response) => {
  const cacheControl = response.headers.get(HEADER_CACHE_CONTROL);
  if (!cacheControl || !response.headers.get(HEADER_SSR_TOOK)) {
    return { cacheControl };
  }
  const parts = cacheControl.replace(/ +/g, '').split(',');
  const { 'max-age': maxAge, 's-maxage': sMaxAge, 'stale-while-revalidate': staleMaxAge } = parts.reduce((result, part) => {
    const [key, value] = part.split('=');
    result[key] = Number(value) || 0;
    return result;
  }, {});
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
const addHeaders = (response, headers) => {
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
const toCacheRes = (response, cacheControl, staleAt) => {
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
const swr = async (event) => {
  if (event.request.method !== 'GET') {
    return fetch(event.request);
  }
  const { pathname } = new URL(event.request.url);
  if (pathname === '/_image'
        || pathname.startsWith('/~')
        || pathname.startsWith('/api/')
        || pathname.startsWith('/_feeds/')) {
    return fetch(event.request);
  }
  const [uri] = event.request.url.split('?', 2);
  const request = new Request(`${uri}?t=${Date.now()}`, event.request);
  const cacheKey = new Request(`${uri}?v=30`, {
    method: event.request.method,
  });
  const cachedRes = await caches.default.match(cacheKey);
  let edgeState = 'miss';
  if (cachedRes) {
    const cachedStaleAt = Number(cachedRes.headers.get(HEADER_STALE_AT));
    if (!(cachedStaleAt > 0)) {
      edgeState = 'bypass';
    } else if (Date.now() > cachedStaleAt) {
      edgeState = 'stale';
      event.waitUntil((async () => {
        const newCacheRes = toCacheRes(await fetch(request));
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
    event.waitUntil(caches.default.put(cacheKey, newCacheRes));
  }
  return addHeaders(response, {
    [HEADER_CACHE_CONTROL]: cacheControl,
    'x-edge-state': edgeState,
  });
};
// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => {
  event.respondWith(swr(event));
});
