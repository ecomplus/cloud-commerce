import type { Request, Response } from 'firebase-functions';
import { join as joinPath } from 'path';
import { readFile } from 'fs/promises';

const {
  STOREFRONT_BASE_DIR,
  STOREFRONT_LONG_CACHE,
} = process.env;

const baseDir = STOREFRONT_BASE_DIR || process.cwd();
const clientRoot = new URL(joinPath(baseDir, 'dist/client/'), import.meta.url);
const isLongCache = String(STOREFRONT_LONG_CACHE).toLowerCase() === 'true';

export default (req: Request, res: Response) => {
  const url = req.url.replace(/\?.*$/, '').replace(/\.html$/, '');

  const setStatusAndCache = (status: number, defaultCache: string) => {
    return res.status(status)
      .set('X-SSR-ID', `v1/${Math.random()}`)
      .set(
        'Cache-Control',
        (typeof global.cache_control === 'function' && global.cache_control(status))
          || defaultCache,
      );
  };

  const redirect = (toUrl: string, status = 302) => {
    let sMaxAge = status === 301 ? 360 : 12;
    if (isLongCache) {
      sMaxAge *= 10;
    }
    let cacheControl = `public, max-age=30, s-maxage=${sMaxAge}`;
    if (status === 302) {
      cacheControl += ', proxy-revalidate';
    }
    setStatusAndCache(status, cacheControl)
      .set('Location', toUrl).end();
  };

  const fallback = (status = 404) => {
    const is404 = status === 404;
    if (is404 && url.slice(-1) === '/') {
      redirect(url.slice(0, -1));
    } else if (url !== `/${status}` && (/\/[^/.]+$/.test(url) || /\.x?html$/.test(url))) {
      setStatusAndCache(status, `public, max-age=${(isLongCache ? 120 : 30)}`)
        .send('<html><head>'
          + `<meta http-equiv="refresh" content="0; url=/${status}?url=${encodeURIComponent(url)}"/>`
          + '</head><body></body></html>');
    } else {
      setStatusAndCache(status, isLongCache && is404
        ? 'public, max-age=60, s-maxage=86400'
        : 'public, max-age=60, s-maxage=300')
        .end();
    }
  };

  /*
  https://github.com/withastro/astro/blob/main/examples/ssr/server/server.mjs
  import { handler as ssrHandler } from '../dist/server/entry.mjs';
  global.ssr_handler = ssrHandler;
  */
  global.ssr_handler(req, res, async (err: any) => {
    if (err) {
      res.set('X-SSR-Error', err.stack);
      fallback(500);
      return;
    }
    const local = new URL(`.${url}`, clientRoot);
    try {
      const data = await readFile(local);
      setStatusAndCache(200, isLongCache
        ? 'public, max-age=60, s-maxage=604800'
        : 'public, max-age=60, s-maxage=600, stale-while-revalidate=2592000')
        .send(data);
    } catch {
      fallback();
    }
  });
};
