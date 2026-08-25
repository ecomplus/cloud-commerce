import type { Request, Response } from 'firebase-functions/v1';
import type { ApiError } from '@cloudcommerce/api';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';

const proxyGithubApi = async (req: Request, res: Response) => {
  const { GITHUB_REPO, GITHUB_TOKEN } = process.env;
  if (!process.env.FEEDS_DISABLE_CORS) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Max-Age', '600');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  }
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  // Authenticated content behind the CDN must never be cached
  res.set('Cache-Control', 'private, no-store');
  const isUserEndpoint = req.path.endsWith('/user');
  if (!GITHUB_REPO && req.path.includes('/repos/_/')) {
    res.status(403).send('Missing GitHub repository name');
    return;
  }
  if (!GITHUB_TOKEN) {
    res.status(403).send('Missing GitHub token');
    return;
  }
  switch (req.method) {
    case 'GET':
    case 'POST':
    case 'PATCH':
    case 'PUT':
    case 'DELETE':
      break;
    default:
      res.sendStatus(406);
      return;
  }
  // Decap CMS sends "token ***", other clients "Bearer ***"
  const accessToken = req.get('Authorization')?.replace(/^(Bearer|token)\s+/i, '');
  if (!accessToken) {
    res.status(401).send('Access token is required on Authorization header');
    return;
  }
  try {
    const { data: authUser } = await api.get('authentications/me', { accessToken });
    if (!authUser.edit_storefront) {
      res.status(401).send('Your auth user does not have permission to edit storefront');
      return;
    }
    if (isUserEndpoint) {
      // Git backends (Decap CMS) expect a GitHub-like user, authenticated store user is the author
      res.send({
        login: authUser.username,
        name: authUser.name || authUser.username,
        email: authUser.email,
      });
      return;
    }
  } catch (_err: any) {
    const error = _err as ApiError;
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      res.status(error.statusCode);
      res.send(error.response?.data || 'Could not authenticate to Store API');
      return;
    }
    res.sendStatus(500);
    logger.error(error);
    return;
  }
  // `req.url` keeps the query string, `req.path` does not (`?ref={branch}` and alike)
  const url = 'https://api.github.com'
    + (req.originalUrl || req.url)
      .replace(/^.+?(?=\/(repos|search)\/)/, '')
      .replace('/repos/_/', `/repos/${GITHUB_REPO}/`);
  const { pathname } = new URL(url);
  let isPathAllowed = false;
  if (pathname.startsWith('/repos/')) {
    const [owner, repo, subresource] = pathname.slice('/repos/'.length).split('/');
    // The PAT may reach more than the store repo, never proxy beyond it
    const isRepoPinned = !GITHUB_REPO || `${owner}/${repo}` === GITHUB_REPO;
    isPathAllowed = isRepoPinned && (!subresource
      || ['git', 'contents', 'issues', 'branches', 'pulls', 'commits'].includes(subresource));
  } else if (pathname === '/search/issues') {
    isPathAllowed = !GITHUB_REPO || `${req.query.q || ''}`.includes(`repo:${GITHUB_REPO}`);
  }
  if (!isPathAllowed) {
    res.status(403).send('Endpoint not allowed through this proxy');
    return;
  }
  const isRepoEndpoint = /\/repos\/[^/]+\/[^/]+$/.test(pathname);
  res.set('X-Proxy-URL', url);
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  let body: string | undefined;
  if (req.method !== 'GET') {
    if (typeof req.body === 'object') {
      body = JSON.stringify(req.body);
      headers['Content-Type'] = 'application/json';
      // Commit messages and content may be multibyte, `body.length` is not the byte count
      headers['Content-Length'] = Buffer.byteLength(body).toString();
    } else {
      body = req.body;
    }
  }
  const timeout = 30000;
  let abortController: AbortController | undefined;
  let timer: NodeJS.Timeout | undefined;
  if (timeout) {
    abortController = new AbortController();
    timer = setTimeout(() => {
      (abortController as AbortController).abort();
    }, timeout);
  }
  try {
    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
      signal: abortController?.signal,
    });
    res.status(response.status);
    logger.info(`Proxied ${url} with status ${response.status}`);
    if (response.status === 204) {
      res.end();
    } else {
      let json: any;
      try {
        json = await response.json();
      } catch {
        //
      }
      if (json !== undefined) {
        if (isRepoEndpoint && response.ok && json && typeof json === 'object') {
          // Write access is granted by store auth (`edit_storefront`), not by the token owner
          json.permissions = { ...json.permissions, pull: true, push: true };
        }
        res.send(json);
      } else {
        res.send(await response.text());
      }
    }
  } catch (err) {
    res.sendStatus(500);
    logger.error(err);
  }
  clearTimeout(timer);
};

export default proxyGithubApi;
