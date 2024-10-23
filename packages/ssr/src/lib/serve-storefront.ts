import type { OutgoingHttpHeaders } from 'node:http';
import type { Request, Response } from 'firebase-functions';
import type { GroupedAnalyticsEvents } from './analytics/send-analytics-events';
import { join as joinPath } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import { minify as minifyHtml } from 'html-minifier';
import { checkUserAgent, fetchAndCache } from './util/ssr-utils';
import { sendAnalyticsEvents } from './analytics/send-analytics-events';

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
const { settingsContent } = config.get();
const { assetsPrefix } = settingsContent;
const execId = `${Date.now() + Math.random()}`;
let imagesManifest: string;
type BuiltImage = { filename: string, width: number, height: number };
const builtImages: BuiltImage[] = [];

const staticFilepaths: string[] = [];
let mainCssFilepath: string | undefined;
const cssFilepaths: string[] = [];
readFile(joinPath(baseDir, 'dist/server/static-builds.csv'), 'utf-8')
  .then((staticBuildsManifest) => {
    staticBuildsManifest.split(/\n/).forEach((line) => {
      const filepath = line.split(',')[0]?.replace(/"/g, '');
      staticFilepaths.push(filepath);
      if (filepath.endsWith('.css')) {
        const cssFilepath = filepath.replace('./dist/client/', '/');
        if (cssFilepath.charAt(0) === '/') {
          cssFilepaths.push(cssFilepath);
        }
      }
    });
    if (cssFilepaths.length === 1) {
      mainCssFilepath = cssFilepaths[0];
    } else if (cssFilepaths.length) {
      mainCssFilepath = cssFilepaths.find((path) => path.includes('/_slug_.'));
    }
  })
  .catch(logger.warn);

export default async (req: Request, res: Response) => {
  if (req.path.startsWith('/~partytown') || req.path.startsWith('/~reverse-proxy')) {
    res.sendStatus(404);
    return;
  }
  if (req.path.endsWith('.html') && !process.env.KEEP_HTML_EXT) {
    res.redirect(301, req.path.replace(/\.html$/, ''));
    return;
  }
  const redirect = (status: 301 | 302, pathname: string) => {
    const projectId = process.env.GCLOUD_PROJECT as string;
    const domain = settingsContent.domain || (projectId && `${projectId}.web.app`);
    if (status === 302 && domain) {
      return res.redirect(status, `https://${domain}${pathname}`);
    }
    return res.redirect(status, pathname);
  };

  const ext = req.path.split('.').pop();
  if (ext === 'js' || ext === 'css' || ext === 'avif' || ext === 'webp') {
    const baseFilepath = req.path.replace(new RegExp(`(\\.|_)[a-zA-Z0-9]+\\.${ext}$`), '');
    if (baseFilepath !== req.path) {
      const filepath = staticFilepaths.find((_filepath) => {
        return _filepath.startsWith(baseFilepath) && _filepath.endsWith(`.${ext}`);
      });
      if (filepath) {
        res.set('Cache-Control', 'max-age=21600, s-maxage=300');
        redirect(302, filepath);
        return;
      }
    }
    if (ext === 'css' && cssFilepaths.length) {
      const baseFilename = req.path.split('/').pop()?.split('.')[0];
      if (baseFilename) {
        const cssFilepath = cssFilepaths.find((path) => {
          return baseFilename === path.split('/').pop()?.split('.')[0];
        });
        if (cssFilepath) {
          res.set('Cache-Control', 'max-age=300');
          redirect(302, cssFilepath);
          return;
        }
      }
    }
  }

  if (req.path === '/_logo' || req.path === '/_icon') {
    const field = req.path.slice(2) as 'logo' | 'icon';
    res.set('Cache-Control', 'max-age=300');
    if (settingsContent[field]) {
      redirect(302, settingsContent[field]);
    } else {
      res.sendStatus(404);
    }
    return;
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
            res.set('Cache-Control', 'max-age=60');
            return redirect(301, `/_astro/${builtImage.filename}`);
          }
          return redirect(302, href);
        })();
        return;
      }
    }
    res.sendStatus(400);
    return;
  }

  if (req.path === '/_analytics') {
    if (req.method !== 'POST') {
      res.sendStatus(405);
      return;
    }
    const url = req.body?.page_location;
    if (typeof url !== 'string' || !url) {
      res.status(400);
      res.send('Pageview URL is required in the `{ page_location }` body field');
      return;
    }
    const events: GroupedAnalyticsEvents = [];
    if (Array.isArray(req.body?.events)) {
      req.body.events.forEach((event) => {
        if (typeof event.type === 'string' && event.type) {
          if (typeof event.name === 'string' && event.name) {
            events.push(event);
          }
        }
      });
    }
    if (!events.length) {
      res.status(400);
      res.send('Event(s) must be sent via the `{ events }` array in the request body');
      return;
    }
    if (!req.get('accept') || !checkUserAgent(req.get('user-agent'))) {
      res.sendStatus(202);
      return;
    }
    // https://stackoverflow.com/questions/48032909/how-to-get-client-ip-address-in-a-firebase-cloud-function
    const ipsHeader = req.get('fastly-client-ip') || req.get('x-forwarded-for');
    const ip = ipsHeader?.split(',')[0] || req.ip;
    await sendAnalyticsEvents({ url, events }, { ...req.body, ip });
    res.sendStatus(201);
    return;
  }

  res.set('X-XSS-Protection', '1; mode=block');
  const pathname = req.path.replace(/\.html$/, '');
  const { SSR_SET_LINK_HEADER, DEPLOY_RAND, BUNNYNET_API_KEY } = process.env;
  const canSetLinkHeader = SSR_SET_LINK_HEADER
    ? String(SSR_SET_LINK_HEADER).toLowerCase() !== 'false'
    : true;

  /*
  Check Response methods used by Astro Node.js integration:
  https://github.com/withastro/astro/blob/main/packages/astro/src/core/app/node.ts
  */
  /* eslint-disable prefer-rest-params */
  const startedAt = Date.now();
  let resolveHeaders: ((v: [number, OutgoingHttpHeaders]) => any) | undefined;
  const waitingHeaders = new Promise<[number, OutgoingHttpHeaders]>((resolve) => {
    resolveHeaders = resolve;
  });
  let resolveHeadersSent: ((v: any) => any) | undefined;
  const waitingHeadersSent = new Promise((resolve) => {
    resolveHeadersSent = resolve;
  });
  const writes: Promise<any>[] = [];
  let outputHtml: string | null = '';
  const _write = res.write;
  const _writeHead = res.writeHead;
  const _end = res.end;
  // @ts-ignore
  res.write = function write(...args: [string | Buffer | Uint8Array, any]) {
    const [chunk] = args;
    if (outputHtml !== null) {
      try {
        const html = typeof chunk === 'string' || Buffer.isBuffer(chunk)
          ? chunk.toString()
          : new TextDecoder().decode(chunk);
        if (html) outputHtml += html;
      } catch {
        outputHtml = null;
      }
    }
    writes.push(new Promise((resolve) => {
      waitingHeadersSent.finally(() => {
        if (!res.writableEnded && outputHtml === null) {
          _write.apply(res, args);
        }
        resolve(null);
      });
    }));
  };
  let sid: string | undefined;
  // @ts-ignore
  res.end = async function end(...args: any) {
    let htmlMin: string | Buffer | undefined;
    if (!res.headersSent) {
      const [status, headers] = await waitingHeaders;
      if (outputHtml !== null) {
        try {
          if (req.acceptsEncodings('gzip')) {
            htmlMin = gzipSync(outputHtml);
            headers['content-encoding'] = 'gzip';
          } else {
            htmlMin = minifyHtml(outputHtml, {
              collapseWhitespace: true,
              removeComments: true,
              removeAttributeQuotes: false,
            });
          }
        } catch {
          //
        }
      }
      if (status === 200 && outputHtml) {
        headers.etag = createHash('sha256').update(outputHtml).digest('base64');
      }
      _writeHead.apply(res, [status, headers]);
    }
    resolveHeadersSent?.(null);
    if (outputHtml !== null) {
      _write.apply(res, [htmlMin || outputHtml, 'utf8']);
    }
    setTimeout(async () => {
      await Promise.all(writes);
      if (!res.writableEnded) _end.apply(res, args);
      // Try to early clear session objects, see storefront/src/lib/ssr-context.ts
      const sessions = global.__sfSessions;
      if (!sid || !sessions[sid]) return;
      if (sessions[sid]._timer) clearTimeout(sessions[sid]._timer);
      sessions[sid] = null;
      delete sessions[sid];
    }, 1);
  };
  // @ts-ignore
  res.writeHead = async function writeHead(status: number, headers?: OutgoingHttpHeaders) {
    if (!headers) {
      headers = {};
    }
    if (canSetLinkHeader && status === 200 && mainCssFilepath) {
      // https://community.cloudflare.com/t/early-hints-need-more-data-before-switching-over/342888/21
      const cssLink = `<${(assetsPrefix || '')}${mainCssFilepath}>; rel=preload; as=style`;
      if (!headers.link) {
        headers.Link = cssLink;
      } else {
        if (typeof headers.link === 'string') {
          headers.link = [headers.link];
        }
        headers.link.push(cssLink);
      }
    }
    const sessions: Record<string, any> | undefined = global.__sfSessions;
    if (typeof headers['x-sid'] === 'string') {
      sid = headers['x-sid'];
    }
    if (sid && sessions?.[sid]) {
      headers['x-sid'] += '_';
      /* Wait to reset status for async context error handling */
      const { fetchingApiContext } = sessions[sid];
      const waitingStatus: Promise<boolean> = fetchingApiContext
        ? new Promise((resolve) => {
          fetchingApiContext.finally(() => {
            const apiContextStatus = sessions[sid!].apiContextError?.statusCode;
            if (apiContextStatus >= 400 && status === 200) {
              status = apiContextStatus;
            }
            resolve(true);
          });
        })
        : Promise.resolve(false);
      await waitingStatus;
    }
    if (BUNNYNET_API_KEY && DEPLOY_RAND) {
      // Tag for CDN cache purge
      // headers['CDN-Tag'] = `[${DEPLOY_RAND}]`;
      // FIXME: Disabled while having unexpected troubles with bunny.net CDN cache purge
      delete headers['CDN-Tag'];
    }
    headers['X-Async-Ex'] = `${execId}_${Date.now() - startedAt}`;
    resolveHeaders?.([status, headers]);
  };

  const setStatusAndCache = (status: number, cacheControl: string) => {
    if (res.headersSent) return res;
    return res.status(status)
      .set('X-SSR-ID', `v1/${Date.now()}`)
      .set('Cache-Control', cacheControl);
  };
  const fallback = (err: any, status = 500) => {
    if (
      pathname !== '/~fallback'
      && (/\/[^/.]+$/.test(pathname) || /\.x?html$/.test(pathname))
    ) {
      setStatusAndCache(status, 'public, max-age=10')
        .send('<html><head>'
          + '<meta http-equiv="refresh" content="0; '
            + `url=/~fallback?status=${status}&url=${encodeURIComponent(pathname)}"/>`
          + `</head><body>${err.toString()}</body></html>`);
    } else {
      setStatusAndCache(status, 'public, max-age=120, s-maxage=600')
        .send(err.toString());
    }
    resolveHeadersSent?.(null);
    resolveHeaders?.([status, res.getHeaders()]);
  };

  const handleException = (err: Error) => {
    if (res.headersSent) {
      logger.error(err, { onExceptionHandler: 1 });
      if (!res.writableEnded) res.end();
      return;
    }
    logger.warn(err);
    res.set('X-SSR-Error', err.message);
    res.set('X-SSR-Error-Stack', err.stack);
    fallback(err);
  };
  const handleRejection = (reason: unknown) => {
    if (reason instanceof Error) {
      handleException(reason);
      return;
    }
    let message = 'UnhandledRejection';
    if (typeof reason === 'string') message += `: ${reason}`;
    const err: any = new Error(message);
    err.reason = reason;
    handleException(err);
  };
  process.once('unhandledRejection', handleRejection);
  process.once('uncaughtException', handleException);
  waitingHeadersSent.finally(() => {
    process.off('unhandledRejection', handleRejection);
    process.off('uncaughtException', handleException);
  });

  global.$ssrFetchAndCache = fetchAndCache;
  /*
  https://github.com/withastro/astro/blob/main/examples/ssr/server/server.mjs
  import { handler as renderStorefront } from '../dist/server/entry.mjs';
  global.$renderStorefront = renderStorefront;
  */
  global.$renderStorefront(req, res, async (err?: Error) => {
    if (err) {
      handleException(err);
      return;
    }
    const clientRoot = new URL(joinPath(baseDir, 'dist/client/'), import.meta.url);
    const local = new URL(`.${pathname}`, clientRoot);
    try {
      const data = await readFile(local);
      setStatusAndCache(200, 'public, max-age=60, s-maxage=600')
        .send(data);
    } catch (_err) {
      fallback(_err, 404);
    }
  });
};
