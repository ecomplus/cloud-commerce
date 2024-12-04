import type { Request, Response } from 'firebase-functions/v1';
import type { ApiError } from '@cloudcommerce/api';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';

const proxyGithubApi = async (req: Request, res: Response) => {
  const { GITHUB_REPO, GITHUB_TOKEN } = process.env;
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
  const accessToken = req.get('Authorization')?.slice(7); // "Bearer ***"
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
  const url = 'https://api.github.com'
    + req.path
      .replace(/^.+\/repos\//, '/repos/')
      .replace('/repos/_/', `/repos/${GITHUB_REPO}/`);
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
      headers['Content-Length'] = body.length.toString();
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
    response.headers.forEach((value, key) => {
      res.set(key, value);
    });
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
