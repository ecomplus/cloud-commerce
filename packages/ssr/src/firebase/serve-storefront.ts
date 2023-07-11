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
  STOREFRONT_BASE_DIR,
  SSR_CACHE_MAXAGE,
  SSR_CACHE_SWR,
} = process.env;
const baseDir = STOREFRONT_BASE_DIR || process.cwd();
const cacheMaxAge = SSR_CACHE_MAXAGE ? Number(SSR_CACHE_MAXAGE) : 1000 * 60 * 2;
const isCacheSWR = SSR_CACHE_SWR ? String(SSR_CACHE_SWR).toLowerCase() === 'true' : true;

const clientRoot = new URL(joinPath(baseDir, 'dist/client/'), import.meta.url);
let imagesManifest: string;
type BuiltImage = { filename: string, width: number, height: number };
const builtImages: BuiltImage[] = [];

export default async (req: Request, res: Response) => {
  if (req.path.startsWith('/~partytown')) {
    res.sendStatus(404);
    return;
  }
  res.set('X-XSS-Protection', '1; mode=block');
  const url = req.url.replace(/\?.*$/, '').replace(/\.html$/, '');

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
  let cacheKeyEndedAt: number | undefined;
  let ssrStartedAt: number | undefined;
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
    const now = Date.now();
    _headers['X-Function-Took'] = String(now - startedAt);
    if (ssrStartedAt) {
      _headers['X-SSR-Took'] = String(now - ssrStartedAt);
    }
    if (cacheKeyEndedAt) {
      _headers['X-Cache-Key-Took'] = String(cacheKeyEndedAt - startedAt);
    }
    if (!res.headersSent) {
      // @ts-ignore
      _writeHead.apply(res, arguments);
    }
    status = _status;
    headers = _headers;
  };

  let cacheRef: DocumentReference<any> | undefined | null;
  let isBodySent = false;
  if (!req.query.__noCache && req.path.charAt(1) !== '~' && cacheMaxAge > 0) {
    try {
      const firestore = getFirestore();
      const cacheKey = (!req.path || req.path === '/')
        ? '__home'
        : req.path.slice(1).replace(/\//g, '_');
      cacheRef = firestore.doc(`ssrCache/${cacheKey}`);
      const cacheDoc = await cacheRef.get();
      cacheKeyEndedAt = Date.now();
      if (cacheDoc.exists) {
        const {
          headers: cachedHeaders,
          status: cachedStatus,
          body: cachedBody,
          __timestamp,
        } = cacheDoc.data();
        const isFresh = (Timestamp.now().toMillis() - __timestamp.toMillis()) < cacheMaxAge;
        if (isFresh || isCacheSWR) {
          cachedHeaders['X-SWR-Date'] = (isFresh ? 'fresh ' : '')
            + __timestamp.toDate().toISOString();
          res.writeHead(cachedStatus || 200, cachedHeaders);
          res.send(cachedBody);
          isBodySent = true;
        }
        if (isFresh) {
          return;
        }
      }
    } catch (err) {
      cacheRef = null;
      logger.warn(err);
    }
  }

  const _write = res.write;
  // @ts-ignore
  res.write = function write(chunk: any) {
    if (!isBodySent) {
      // @ts-ignore
      _write.apply(res, arguments);
    }
    chunks.push(chunk);
  };
  const _end = res.end;
  // @ts-ignore
  res.end = function end() {
    if (!isBodySent) {
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
        __timestamp: Timestamp.now(),
      }).catch(logger.warn);
    }
  };

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
