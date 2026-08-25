import {
  describe, test, expect, vi, beforeEach,
} from 'vitest';

vi.mock('@cloudcommerce/firebase/lib/config', () => ({
  logger: { info: () => {}, error: () => {}, warn: () => {} },
}));
vi.mock('@cloudcommerce/api', () => ({ default: { get: vi.fn() } }));

import api from '@cloudcommerce/api';
import proxyGithubApi from '../src/firebase/proxy-github';

const apiGet = api.get as ReturnType<typeof vi.fn>;

const AUTH_USER = {
  username: 'marketing1',
  name: 'Marketing',
  email: 'mkt@example.com',
  edit_storefront: true,
};

const makeReq = (path: string, {
  method = 'GET',
  auth = 'token store-access-token-123',
  body,
  query = {},
}: Record<string, any> = {}) => {
  const [pathname, search] = path.split('?');
  const searchParams = new URLSearchParams(search || '');
  searchParams.forEach((value, key) => { query[key] = value; });
  return {
    path: pathname,
    originalUrl: path,
    url: path,
    method,
    query,
    body,
    get: (header: string) => (header === 'Authorization' ? auth : undefined),
  } as any;
};

const makeRes = () => {
  const res: any = {
    headers: {} as Record<string, string>,
    statusCode: 200,
    body: undefined,
    ended: false,
  };
  res.set = (k: string, v: string) => { res.headers[k] = v; return res; };
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.send = (body: any) => { res.body = body; res.ended = true; return res; };
  res.sendStatus = (code: number) => { res.statusCode = code; res.ended = true; return res; };
  res.end = () => { res.ended = true; return res; };
  return res;
};

const ghFetch = vi.fn();

beforeEach(() => {
  process.env.GITHUB_REPO = 'tiasonia/tiasonia';
  process.env.GITHUB_TOKEN = 'ghp_test';
  delete process.env.FEEDS_DISABLE_CORS;
  apiGet.mockReset().mockResolvedValue({ data: AUTH_USER });
  ghFetch.mockReset().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ default_branch: 'main' }),
  });
  vi.stubGlobal('fetch', ghFetch);
});

describe('CORS and OPTIONS', () => {
  test('answers preflight without auth nor upstream call', async () => {
    const res = makeRes();
    await proxyGithubApi(makeReq('/_api/repos/tiasonia/tiasonia', { method: 'OPTIONS', auth: undefined }), res);
    expect(res.ended).toBe(true);
    expect(res.headers['Access-Control-Allow-Headers']).toContain('Authorization');
    expect(apiGet).not.toHaveBeenCalled();
    expect(ghFetch).not.toHaveBeenCalled();
  });
});

describe('authentication', () => {
  test.each(['token abc123', 'Bearer abc123'])('accepts "%s" scheme', async (auth) => {
    const res = makeRes();
    await proxyGithubApi(makeReq('/_api/user', { auth }), res);
    expect(apiGet).toHaveBeenCalledWith('authentications/me', { accessToken: 'abc123' });
  });

  test('rejects store user without edit_storefront', async () => {
    apiGet.mockResolvedValue({ data: { ...AUTH_USER, edit_storefront: false } });
    const res = makeRes();
    await proxyGithubApi(makeReq('/_api/repos/tiasonia/tiasonia'), res);
    expect(res.statusCode).toBe(401);
    expect(ghFetch).not.toHaveBeenCalled();
  });
});

describe('/user stub', () => {
  test('answers with the store user as a GitHub-like user', async () => {
    const res = makeRes();
    await proxyGithubApi(makeReq('/_api/user'), res);
    expect(res.body).toMatchObject({ login: 'marketing1', name: 'Marketing' });
    expect(res.headers['Cache-Control']).toBe('private, no-store');
    expect(res.headers['X-Content-Type-Options']).toBe('nosniff');
    expect(ghFetch).not.toHaveBeenCalled();
  });
});

describe('path ACL', () => {
  test('pins the repository to GITHUB_REPO', async () => {
    const res = makeRes();
    await proxyGithubApi(makeReq('/_api/repos/evil/evil/contents/x'), res);
    expect(res.statusCode).toBe(403);
    expect(ghFetch).not.toHaveBeenCalled();
  });

  test.each(['hooks', 'keys', 'collaborators', 'actions'])(
    'rejects %s subresource',
    async (sub) => {
      const res = makeRes();
      await proxyGithubApi(makeReq(`/_api/repos/tiasonia/tiasonia/${sub}`), res);
      expect(res.statusCode).toBe(403);
    },
  );

  test.each([
    '/_api/repos/tiasonia/tiasonia',
    '/_api/repos/tiasonia/tiasonia/contents/content/home.json',
    '/_api/repos/tiasonia/tiasonia/git/refs/heads/main',
    '/_api/repos/tiasonia/tiasonia/pulls',
    '/_api/repos/tiasonia/tiasonia/branches/main',
  ])('allows %s', async (path) => {
    const res = makeRes();
    await proxyGithubApi(makeReq(path), res);
    expect(res.statusCode).toBe(200);
    expect(ghFetch).toHaveBeenCalled();
  });

  test('search allowed only scoped to the store repo', async () => {
    let res = makeRes();
    await proxyGithubApi(makeReq('/_api/search/issues?q=repo%3Atiasonia%2Ftiasonia+label%3Ax'), res);
    expect(res.statusCode).toBe(200);
    res = makeRes();
    await proxyGithubApi(makeReq('/_api/search/issues?q=repo%3Aevil%2Fevil'), res);
    expect(res.statusCode).toBe(403);
  });
});

describe('proxied request building', () => {
  test('keeps the query string (?ref={branch})', async () => {
    const res = makeRes();
    await proxyGithubApi(
      makeReq('/_api/repos/tiasonia/tiasonia/contents/content/home.json?ref=cms%2Fhome'),
      res,
    );
    const url = ghFetch.mock.calls[0][0];
    expect(url).toBe('https://api.github.com/repos/tiasonia/tiasonia/contents/content/home.json?ref=cms%2Fhome');
  });

  test('sends the byte count on Content-Length for multibyte bodies', async () => {
    const body = { message: 'Update home “página inicial”', content: 'eyJhIjoxfQ==' };
    const res = makeRes();
    await proxyGithubApi(
      makeReq('/_api/repos/tiasonia/tiasonia/contents/content/home.json', { method: 'PUT', body }),
      res,
    );
    const { headers } = ghFetch.mock.calls[0][1];
    const raw = JSON.stringify(body);
    expect(Number(headers['Content-Length'])).toBe(Buffer.byteLength(raw));
    expect(Number(headers['Content-Length'])).toBeGreaterThan(raw.length);
  });
});

describe('bare repository endpoint', () => {
  test('reports push permission granted by store auth', async () => {
    ghFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ full_name: 'tiasonia/tiasonia', permissions: { admin: false, push: false } }),
    });
    const res = makeRes();
    await proxyGithubApi(makeReq('/_api/repos/tiasonia/tiasonia'), res);
    expect(res.body.permissions).toMatchObject({ push: true, pull: true });
  });

  test('does not inject permissions on error responses', async () => {
    ghFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not Found' }),
    });
    const res = makeRes();
    await proxyGithubApi(makeReq('/_api/repos/tiasonia/tiasonia'), res);
    expect(res.statusCode).toBe(404);
    expect(res.body.permissions).toBeUndefined();
  });
});
