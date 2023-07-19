import type { OutgoingHttpHeaders } from 'node:http';
import type { Request, Response } from 'firebase-functions';
import type { DocumentReference } from 'firebase-admin/firestore';
import { join as joinPath } from 'node:path';
import { readFile } from 'node:fs/promises';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';

declare global {
  // eslint-disable-next-line
  var $renderStorefront: (
    req: Request,
    res: Response,
    next: (err: any) => Promise<void>,
  ) => Promise<any>;
}

const {
  DEPLOY_RAND,
  STOREFRONT_BASE_DIR,
  SSR_CACHE_MAXAGE,
  SSR_CACHE_SWR,
  SSR_PROXY_DEBUG,
  SSR_PROXY_TIMEOUT,
} = process.env;

const cacheMaxAge = SSR_CACHE_MAXAGE ? Number(SSR_CACHE_MAXAGE) : 1000 * 60 * 2;
const isCacheSWR = SSR_CACHE_SWR ? String(SSR_CACHE_SWR).toLowerCase() === 'true' : true;
const lockedCacheKeys: string[] = [];

const baseDir = STOREFRONT_BASE_DIR || process.cwd();
const clientRoot = new URL(joinPath(baseDir, 'dist/client/'), import.meta.url);
let imagesManifest: string;
type BuiltImage = { filename: string, width: number, height: number };
const builtImages: BuiltImage[] = [];

const isProxyDebug = SSR_PROXY_DEBUG ? String(SSR_PROXY_DEBUG).toLowerCase() === 'true' : false;
const proxyTimeout = SSR_PROXY_TIMEOUT ? Number(SSR_PROXY_TIMEOUT) : 3000;

const proxy = async (req: Request, res: Response) => {
  let proxyURL: URL | undefined;
  try {
    proxyURL = new URL(req.query.url as any);
  } catch {
    //
  }
  if (proxyURL) {
    const { headers } = req;
    /* eslint-disable dot-notation */
    headers['origin'] = String(headers['x-forwarded-host']);
    headers['host'] = proxyURL.hostname;
    if (!headers['accept']) {
      headers['accept'] = 'text/plain,text/html,application/javascript,application/x-javascript';
    }
    headers['accept-encoding'] = 'gzip';
    delete headers['forwarded'];
    delete headers['via'];
    delete headers['traceparent'];
    delete headers['upgrade-insecure-requests'];
    delete headers['x-timer'];
    delete headers['x-varnish'];
    delete headers['x-orig-accept-language'];
    /* eslint-enable dot-notation */
    Object.keys(headers).forEach((headerName) => {
      if (
        headerName.startsWith('x-forwarded-')
        || headerName.startsWith('cdn-')
        || headerName.startsWith('fastly-')
        || headerName.startsWith('x-firebase-')
        || headerName.startsWith('x-cloud-')
        || headerName.startsWith('x-appengine-')
        || headerName.startsWith('function-')
        || typeof headers[headerName] !== 'string'
      ) {
        delete headers[headerName];
      }
    });
    if (isProxyDebug) {
      logger.info({ proxy: proxyURL.href });
    }
    try {
      const abortController = new AbortController();
      const timer = setTimeout(() => {
        abortController.abort();
      }, proxyTimeout);
      const response = await fetch(proxyURL, {
        method: 'get',
        headers: (headers as Record<string, string>),
        signal: abortController.signal,
      });
      clearTimeout(timer);
      res.status(response.status);
      Object.keys(response.headers).forEach((headerName) => {
        switch (headerName) {
          case 'transfer-encoding':
          case 'connection':
          case 'strict-transport-security':
          case 'alt-svc':
          case 'server':
            break;
          default:
            res.set(headerName, response.headers[headerName]);
        }
      });
      res.set('access-control-allow-origin', '*');
      res.send(await response.text());
    } catch (err: any) {
      logger.warn(err);
      res.status(400).send(err.message);
    }
    return;
  }
  res.sendStatus(400);
};

export default async (req: Request, res: Response) => {
  if (req.path.startsWith('/~partytown')) {
    res.sendStatus(404);
    return;
  }
  if (req.path.startsWith('/~reverse-proxy')) {
    proxy(req, res);
    return;
  }
  res.set('X-XSS-Protection', '1; mode=block');
  const url = req.path.replace(/\.html$/, '');

  const setStatusAndCache = (status: number, cacheControl: string) => {
    if (res.headersSent) return res;
    return res.status(status)
      .set('X-SSR-ID', `v1/${Date.now()}`)
      .set('Cache-Control', cacheControl);
  };

  const fallback = (err: any, status = 500) => {
    if (url !== '/fallback' && (/\/[^/.]+$/.test(url) || /\.x?html$/.test(url))) {
      setStatusAndCache(status, 'public, max-age=120')
        .send('<html><head>'
          + '<meta http-equiv="refresh" content="0; '
            + `url=/fallback?status=${status}&url=${encodeURIComponent(url)}"/>`
          + `</head><body>${err.toString()}</body></html>`);
    } else {
      setStatusAndCache(status, 'public, max-age=120, s-maxage=600')
        .send(err.toString());
    }
  };

  if (req.path === '/_image') {
    const { href } = req.query;
    if (typeof href === 'string' && href.length > 3) {
      const width = Number(req.query.w);
      const format = String(req.query.f);
      if (width > 0 && /^(webp|avif|png|jpg|jpeg)$/.test(format)) {
        (async () => {
          if (!imagesManifest) {
            const manifestFilepath = joinPath(baseDir, 'dist/server/images.dist.csv');
            imagesManifest = await readFile(manifestFilepath, 'utf-8');
            imagesManifest.split(/\n/).forEach((line) => {
              const [filename, _width, height] = line.split(',');
              builtImages.push({
                filename,
                width: Number(_width),
                height: Number(height),
              });
            });
            builtImages.sort((a, b) => {
              if (a.width < b.width) return -1;
              return 1;
            });
          }
          const filename = href.replace(/^.*\//, '').replace(/.\w+(\?.*)?$/, '');
          const filenameRegExp = new RegExp(`[_.][a-z0-9]+\\.${format}$`, 'i');
          const builtImage = builtImages.find((_builtImage) => {
            return _builtImage.width >= width
              && filename === _builtImage.filename.replace(filenameRegExp, '');
          });
          if (builtImage) {
            return res.redirect(301, `/_astro/${builtImage.filename}`);
          }
          return res.redirect(302, href);
        })();
        return;
      }
    }
    res.sendStatus(400);
    return;
  }

  const startedAt = Date.now();
  let ssrStartedAt: number | undefined;
  const cacheKey = (!req.path || req.path === '/')
    ? '__home'
    : req.path.slice(1).replace(/\//g, '_');
  let cacheRef: DocumentReference<any> | undefined | null;
  let isCachedBodySent = false;
  let isSSRChunkSent = false;
  let status: number;
  let headers: OutgoingHttpHeaders = {};
  const chunks: any[] = [];

  /*
  Check Response methods used by Astro Node.js integration:
  https://github.com/withastro/astro/blob/main/packages/integrations/node/src/nodeMiddleware.ts
  */
  const _writeHead = res.writeHead;
  /* eslint-disable prefer-rest-params */
  // @ts-ignore
  res.writeHead = function writeHead(_status: number, _headers: OutgoingHttpHeaders) {
    status = _status;
    if (_headers) {
      const now = Date.now();
      _headers['X-Function-Took'] = String(now - startedAt);
      if (ssrStartedAt) {
        _headers['X-SSR-Took'] = String(now - ssrStartedAt);
      }
      headers = _headers;
    }
    if (!res.headersSent) {
      // @ts-ignore
      _writeHead.apply(res, arguments);
    }
  };
  const _write = res.write;
  // @ts-ignore
  res.write = function write(chunk: any) {
    if (!isCachedBodySent) {
      // @ts-ignore
      _write.apply(res, arguments);
      isSSRChunkSent = true;
    }
    chunks.push(chunk);
  };
  const _end = res.end;
  // @ts-ignore
  res.end = function end() {
    if (!isCachedBodySent) {
      // @ts-ignore
      _end.apply(res, arguments);
    }
    if (!status) {
      status = res.statusCode;
    }
    if (cacheRef && status === 200) {
      cacheRef.set({
        headers,
        status,
        body: Buffer.concat(chunks).toString('utf8'),
        __deploy: DEPLOY_RAND,
        __timestamp: Timestamp.now(),
      }).catch(logger.warn);
    }
    for (let i = lockedCacheKeys.length - 1; i >= 0; i--) {
      if (lockedCacheKeys[i] === cacheKey) {
        lockedCacheKeys.splice(i, 1);
      }
    }
  };

  const isSWRLocked = lockedCacheKeys.includes(cacheKey);
  let gettingCacheDoc: Promise<void> | undefined;
  if (req.query.__noCache === undefined && req.path.charAt(1) !== '~' && cacheMaxAge > 0) {
    gettingCacheDoc = (async () => {
      try {
        const firestore = getFirestore();
        cacheRef = firestore.doc(`ssrCache/${cacheKey}`);
        const cacheDoc = await cacheRef.get();
        if (!isSSRChunkSent && cacheDoc.exists) {
          const {
            headers: cachedHeaders,
            status: cachedStatus = 200,
            body: cachedBody,
            __deploy,
            __timestamp,
          } = cacheDoc.data();
          const isFresh = (Timestamp.now().toMillis() - __timestamp.toMillis()) <= cacheMaxAge;
          if (__deploy !== DEPLOY_RAND) return;
          if (isFresh || isCacheSWR) {
            if (!res.headersSent) {
              cachedHeaders['X-SWR-Date'] = (isFresh ? 'fresh ' : '')
                + __timestamp.toDate().toISOString();
              cachedHeaders['X-Function-Took'] = String(Date.now() - startedAt);
              Object.keys(cachedHeaders).forEach((headerName) => {
                res.set(headerName, cachedHeaders[headerName]);
              });
              _writeHead.apply(res, [cachedStatus, cachedHeaders]);
            }
            _write.apply(res, [cachedBody, 'utf8']);
            _end.apply(res);
            isCachedBodySent = true;
          }
        }
      } catch (err) {
        cacheRef = null;
        logger.warn(err);
      }
    })();
  }
  if (gettingCacheDoc && (!isCacheSWR || isSWRLocked)) {
    await gettingCacheDoc;
    if (isCachedBodySent) return;
  }
  if (isCacheSWR) {
    lockedCacheKeys.push(cacheKey);
  }

  /*
  https://github.com/withastro/astro/blob/main/examples/ssr/server/server.mjs
  import { handler as renderStorefront } from '../dist/server/entry.mjs';
  global.$renderStorefront = renderStorefront;
  */
  ssrStartedAt = Date.now();
  global.$renderStorefront(req, res, async (err: any) => {
    if (err) {
      if (res.headersSent) {
        logger.error(err);
        res.end();
        return;
      }
      logger.warn(err);
      res.set('X-SSR-Error', err.message);
      res.set('X-SSR-Error-Stack', err.stack);
      fallback(err);
      return;
    }
    const local = new URL(`.${url}`, clientRoot);
    try {
      const data = await readFile(local);
      setStatusAndCache(200, 'public, max-age=60, s-maxage=600')
        .send(data);
    } catch (e) {
      fallback(e, 404);
    }
  });
};
