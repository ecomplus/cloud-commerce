import type { OutgoingHttpHeaders } from 'node:http';
import type { Request, Response } from 'firebase-functions';
import type { GroupedAnalyticsEvents } from './analytics/send-analytics-events';
import { join as joinPath } from 'node:path';
import { readFile } from 'node:fs/promises';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { warn, error } from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import { pathToDocId, checkUserAgent } from './util/ssr-utils';
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
  .catch(warn);

export default async (req: Request, res: Response) => {
  if (req.path.startsWith('/~partytown') || req.path.startsWith('/~reverse-proxy')) {
    res.sendStatus(404);
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

  if (req.path === '/_logo' || req.path === '/_icon') {
    const field = req.path.slice(2) as 'logo' | 'icon';
    res.set('Cache-Control', 'max-age=300');
    if (settingsContent[field]) {
      res.redirect(302, settingsContent[field]);
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
            return res
              .set('Cache-Control', 'max-age=60')
              .redirect(301, `/_astro/${builtImage.filename}`);
          }
          return res.redirect(302, href);
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
    await sendAnalyticsEvents({ url, events }, { ...req.body, ip: req.ip });
    res.sendStatus(201);
    return;
  }

  res.set('X-XSS-Protection', '1; mode=block');
  const pathname = req.path.replace(/\.html$/, '');

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
      setStatusAndCache(status, 'public, max-age=120')
        .send('<html><head>'
          + '<meta http-equiv="refresh" content="0; '
            + `url=/~fallback?status=${status}&url=${encodeURIComponent(pathname)}"/>`
          + `</head><body>${err.toString()}</body></html>`);
    } else {
      setStatusAndCache(status, 'public, max-age=120, s-maxage=600')
        .send(err.toString());
    }
  };

  const { SSR_SET_LINK_HEADER, DEPLOY_RAND, BUNNYNET_API_KEY } = process.env;
  const canSetLinkHeader = SSR_SET_LINK_HEADER
    ? String(SSR_SET_LINK_HEADER).toLowerCase() !== 'false'
    : true;
  /*
  Check Response methods used by Astro Node.js integration:
  https://github.com/withastro/astro/blob/main/packages/astro/src/core/app/node.ts
  */
  const _writeHead = res.writeHead;
  /* eslint-disable prefer-rest-params */
  // @ts-ignore
  res.writeHead = async function writeHead(status: number, headers?: OutgoingHttpHeaders) {
    const startedAt = Date.now();
    let resolveHeadersSent: ((v: any) => any) | undefined;
    const waitingHeadersSent = new Promise((resolve) => {
      resolveHeadersSent = resolve;
    });
    if (!headers) {
      headers = {};
    }
    if (canSetLinkHeader && status === 200 && cssFilepath) {
      // https://community.cloudflare.com/t/early-hints-need-more-data-before-switching-over/342888/21
      const cssLink = `<${(assetsPrefix || '')}${cssFilepath}>; rel=preload; as=style`;
      if (!headers.link) {
        headers.Link = cssLink;
      } else {
        if (typeof headers.link === 'string') {
          headers.link = [headers.link];
        }
        headers.link.push(cssLink);
      }
    }
    // Try to early clear session objects, see storefront/src/lib/ssr-context.ts
    const sessions = global.__sfSessions;
    const sid = headers['x-sid'];
    if (sessions && typeof sid === 'string' && sessions[sid]) {
      headers['x-sid'] += '_';
      /* Wait to reset status for async context error handling */
      const { fetchingApiContext } = sessions[sid];
      const waitingStatus: Promise<boolean> = fetchingApiContext
        ? new Promise((resolve) => {
          fetchingApiContext.finally(() => {
            const apiContextStatus = sessions[sid].apiContextError?.statusCode;
            if (apiContextStatus >= 400 && status === 200) {
              status = apiContextStatus;
            }
            resolve(true);
          });
        })
        : Promise.resolve(false);
      const _write = res.write;
      const writes: Promise<any>[] = [];
      // @ts-ignore
      res.write = function write(...args: any) {
        writes.push(new Promise((resolve) => {
          waitingHeadersSent.finally(() => {
            _write.apply(res, args);
            resolve(null);
          });
        }));
      };
      const _end = res.end;
      // @ts-ignore
      res.end = async function end(...args: any) {
        await waitingHeadersSent;
        setTimeout(async () => {
          await Promise.all(writes);
          if (sessions[sid]._timer) clearTimeout(sessions[sid]._timer);
          sessions[sid] = null;
          delete sessions[sid];
          _end.apply(res, args);
        }, 1);
      };
      await waitingStatus;
    }
    if (BUNNYNET_API_KEY && DEPLOY_RAND) {
      // Tag for CDN cache purge
      // headers['CDN-Tag'] = `[${DEPLOY_RAND}]`;
      // FIXME: Disabled while having unexpected troubles with bunny.net CDN cache purge
      delete headers['CDN-Tag'];
    }
    headers['X-Async-Ex'] = `${execId}_${Date.now() - startedAt}`;
    _writeHead.apply(res, [status, headers]);
    resolveHeadersSent?.(null);
    if (status === 200) {
      if (
        pathname.startsWith('/~')
        || pathname.startsWith('/.')
        || pathname.startsWith('/app/')
        || pathname.startsWith('/admin/')
      ) {
        // Routes with short cache TTL, see cli/ci/bunny-config-base.sh
        return;
      }
      getFirestore().doc(`ssrReqs/${pathToDocId(pathname)}`)
        .set({
          pathname,
          count: FieldValue.increment(1),
          isCachePurged: false,
          at: Timestamp.now(),
        }, { merge: true })
        .catch(warn);
    }
  };

  /*
  https://github.com/withastro/astro/blob/main/examples/ssr/server/server.mjs
  import { handler as renderStorefront } from '../dist/server/entry.mjs';
  global.$renderStorefront = renderStorefront;
  */
  global.$renderStorefront(req, res, async (err: any) => {
    if (err) {
      if (res.headersSent) {
        error(err);
        res.end();
        return;
      }
      warn(err);
      res.set('X-SSR-Error', err.message);
      res.set('X-SSR-Error-Stack', err.stack);
      fallback(err);
      return;
    }
    const clientRoot = new URL(joinPath(baseDir, 'dist/client/'), import.meta.url);
    const local = new URL(`.${pathname}`, clientRoot);
    try {
      const data = await readFile(local);
      setStatusAndCache(200, 'public, max-age=60, s-maxage=600')
        .send(data);
    } catch (e) {
      fallback(e, 404);
    }
  });
};
