import type { Request, Response } from 'firebase-functions';
import type { OutgoingHttpHeaders, OutgoingHttpHeader } from 'http';
import { join as joinPath } from 'path';
import { readFile } from 'fs/promises';
import { gzip } from 'zlib';
import logger from 'firebase-functions/lib/logger';

const { STOREFRONT_BASE_DIR } = process.env;
const baseDir = STOREFRONT_BASE_DIR || process.cwd();
const clientRoot = new URL(joinPath(baseDir, 'dist/client/'), import.meta.url);

type InterceptedResponse = Response & {
  WRITEHEAD?: Response['writeHead'],
  WRITE?: Response['write'],
};

export default (req: Request, res: InterceptedResponse) => {
  logger.info('Serving storefront');
  const url = req.url.replace(/\?.*$/, '').replace(/\.html$/, '');

  const setStatusAndCache = (status: number, defaultCache: string) => {
    return res.status(status).set(
      'Cache-Control',
      (typeof global.cache_control === 'function' && global.cache_control(status))
        || defaultCache,
    );
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

  res.WRITEHEAD = res.writeHead;
  res.writeHead = (
    statusCode: number,
    headers?: string | OutgoingHttpHeaders | OutgoingHttpHeader[],
  ) => {
    if (headers && typeof headers === 'object' && !Array.isArray(headers)) {
      delete headers['transfer-encoding'];
      headers['Transfer-Encoding'] = 'gzip, chunked';
      headers['X-SSR-ID'] = `v1/${Date.now()}`;
    }
    return (res.WRITEHEAD as Response['writeHead'])(
      statusCode,
      headers as OutgoingHttpHeaders,
    );
  };

  res.WRITE = res.write;
  res.write = (chunk: any) => {
    gzip(chunk, (err, data) => {
      if (err) {
        logger.error(err);
        fallback(err);
      } else {
        (res.WRITE as Response['write'])(data);
      }
    });
    return true;
  };

  /*
  https://github.com/withastro/astro/blob/main/examples/ssr/server/server.mjs
  import { handler as ssrHandler } from '../dist/server/entry.mjs';
  global.ssr_handler = ssrHandler;
  */
  global.ssr_handler(req, res, async (err: any) => {
    if (err) {
      res.set('X-SSR-Error', err.message);
      fallback(err);
      return;
    }
    const local = new URL(`.${url}`, clientRoot);
    try {
      const data = await readFile(local);
      setStatusAndCache(200, 'public, max-age=60, s-maxage=600')
        .send(data);
    } catch {
      fallback(err, 404);
    }
  });
};
