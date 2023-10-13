import type { OutgoingHttpHeaders } from 'node:http';
import type { Request, Response } from 'firebase-functions';
import { join as joinPath } from 'node:path';
import { readFile } from 'node:fs/promises';
import logger from 'firebase-functions/logger';

declare global {
  // eslint-disable-next-line
  var $renderStorefront: (
    req: Request,
    res: Response,
    next: (err: any) => Promise<void>,
  ) => Promise<any>;
}

const { STOREFRONT_BASE_DIR } = process.env;
const baseDir = STOREFRONT_BASE_DIR || process.cwd();
let imagesManifest: string;
type BuiltImage = { filename: string, width: number, height: number };
const builtImages: BuiltImage[] = [];

const staticFilepaths: string[] = [];
let cssFilepath: string | undefined;
readFile(joinPath(baseDir, 'dist/server/static-builds.csv'), 'utf-8')
  .then((staticBuildsManifest) => {
    const cssFiles: string[] = [];
    staticBuildsManifest.split(/\n/).forEach((line) => {
      const [filepath] = line.split(',');
      staticFilepaths.push(filepath);
      if (filepath.endsWith('.css')) cssFiles.push(filepath);
    });
    if (cssFiles.length === 1) {
      cssFilepath = cssFiles[0]?.replace('./dist/client/', '/');
      if (
        cssFilepath
        && cssFilepath.charAt(0) !== '/'
        && !cssFilepath.startsWith('https://')
      ) {
        cssFilepath = `/${cssFilepath}`;
      }
    }
  })
  .catch(logger.warn);

const proxy = async (req: Request, res: Response) => {
  const { SSR_PROXY_DEBUG, SSR_PROXY_TIMEOUT } = process.env;
  const isDebug = SSR_PROXY_DEBUG ? String(SSR_PROXY_DEBUG).toLowerCase() === 'true' : false;
  const timeout = SSR_PROXY_TIMEOUT ? Number(SSR_PROXY_TIMEOUT) : 3000;
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
    if (isDebug) {
      logger.info({ proxy: proxyURL.href });
    }
    try {
      const abortController = new AbortController();
      const timer = setTimeout(() => {
        abortController.abort();
      }, timeout);
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

  const ext = req.path.split('.').pop();
  if (ext === 'js' || ext === 'css' || ext === 'avif' || ext === 'webp') {
    const baseFilepath = req.path.replace(new RegExp(`(\\.|_)[a-zA-Z0-9]+\\.${ext}$`), '');
    if (baseFilepath !== req.path) {
      const filepath = staticFilepaths.find((_filepath) => {
        return _filepath.startsWith(baseFilepath) && _filepath.endsWith(`.${ext}`);
      });
      if (filepath) {
        res.set('Cache-Control', 'max-age=21600').redirect(302, filepath);
        return;
      }
    }
    if (ext === 'css' && cssFilepath) {
      res.set('Cache-Control', 'max-age=3600').redirect(302, cssFilepath);
      return;
    }
  }

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

  res.set('X-XSS-Protection', '1; mode=block');
  const url = req.path.replace(/\.html$/, '');

  const setStatusAndCache = (status: number, cacheControl: string) => {
    if (res.headersSent) return res;
    return res.status(status)
      .set('X-SSR-ID', `v1/${Date.now()}`)
      .set('Cache-Control', cacheControl);
  };

  const fallback = (err: any, status = 500) => {
    if (url !== '/~fallback' && (/\/[^/.]+$/.test(url) || /\.x?html$/.test(url))) {
      setStatusAndCache(status, 'public, max-age=120')
        .send('<html><head>'
          + '<meta http-equiv="refresh" content="0; '
            + `url=/~fallback?status=${status}&url=${encodeURIComponent(url)}"/>`
          + `</head><body>${err.toString()}</body></html>`);
    } else {
      setStatusAndCache(status, 'public, max-age=120, s-maxage=600')
        .send(err.toString());
    }
  };

  const { SSR_SET_LINK_HEADER } = process.env;
  const canSetLinkHeader = SSR_SET_LINK_HEADER
    ? String(SSR_SET_LINK_HEADER).toLowerCase() !== 'false'
    : true;
  if (canSetLinkHeader) {
    /*
    Check Response methods used by Astro Node.js integration:
    https://github.com/withastro/astro/blob/main/packages/integrations/node/src/nodeMiddleware.ts
    */
    const _writeHead = res.writeHead;
    /* eslint-disable prefer-rest-params */
    // @ts-ignore
    res.writeHead = function writeHead(status: number, headers: OutgoingHttpHeaders) {
      if (status === 200 && headers && cssFilepath && !headers.link) {
        // https://community.cloudflare.com/t/early-hints-need-more-data-before-switching-over/342888/21
        headers.Link = `<${cssFilepath}>; rel=preload; as=style`;
      }
      _writeHead.apply(res, [status, headers]);
    };
  }

  /*
  https://github.com/withastro/astro/blob/main/examples/ssr/server/server.mjs
  import { handler as renderStorefront } from '../dist/server/entry.mjs';
  global.$renderStorefront = renderStorefront;
  */
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
    const clientRoot = new URL(joinPath(baseDir, 'dist/client/'), import.meta.url);
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
