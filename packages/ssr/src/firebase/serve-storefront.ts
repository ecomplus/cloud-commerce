import type { Request, Response } from 'firebase-functions';
import { join as joinPath } from 'path';
import { readFile } from 'fs/promises';
import compression from 'compression';

const { STOREFRONT_BASE_DIR } = process.env;
const baseDir = STOREFRONT_BASE_DIR || process.cwd();
const clientRoot = new URL(joinPath(baseDir, 'dist/client/'), import.meta.url);
const compress = compression();

export default (req: Request, res: Response) => {
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Content-Security-Policy', "default-src 'self'");
  const url = req.url.replace(/\?.*$/, '').replace(/\.html$/, '');

  const setStatusAndCache = (status: number, defaultCache: string) => {
    return res.status(status)
      .set('X-SSR-ID', `v1/${Date.now()}`)
      .set(
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

  compress(req, res, async () => {
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
  });
};
