import type { Request, Response } from 'firebase-functions';
import { info, warn } from 'firebase-functions/logger';

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
      info({ proxy: proxyURL.href });
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
      warn(err);
      res.status(400).send(err.message);
    }
    return;
  }
  res.sendStatus(400);
};

export default proxy;
