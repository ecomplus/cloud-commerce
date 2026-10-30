import assert from 'node:assert';
import test, { describe } from 'node:test';
import requestWithRetry from '../lib-mjs/lib/braspag/request-with-retry.mjs';

const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), {
  response: { status },
});

// Fake request answering the given results in order
const sequence = (...results) => {
  let calls = 0;
  const request = async () => {
    const result = results[calls];
    calls += 1;
    if (result instanceof Error) throw result;
    return result;
  };
  return { request, calls: () => calls };
};

describe('Braspag token requests', () => {
  test('429 then 200: resolves with the retry', async () => {
    const { request, calls } = sequence(httpError(429), { data: 'ok' });
    assert.deepStrictEqual(await requestWithRetry(request, 1), { data: 'ok' });
    assert.strictEqual(calls(), 2);
  });

  test('429 twice: rejects after a single retry', async () => {
    const { request, calls } = sequence(httpError(429), httpError(429), { data: 'ok' });
    await assert.rejects(requestWithRetry(request, 1), /HTTP 429/);
    assert.strictEqual(calls(), 2);
  });

  test('5xx, other 4xx and network errors are not retried', async () => {
    const unavailable = sequence(httpError(503), { data: 'ok' });
    await assert.rejects(requestWithRetry(unavailable.request, 1), /HTTP 503/);
    assert.strictEqual(unavailable.calls(), 1);
    const unauthorized = sequence(httpError(401), { data: 'ok' });
    await assert.rejects(requestWithRetry(unauthorized.request, 1), /HTTP 401/);
    assert.strictEqual(unauthorized.calls(), 1);
    const network = sequence(new Error('ECONNRESET'), { data: 'ok' });
    await assert.rejects(requestWithRetry(network.request, 1), /ECONNRESET/);
    assert.strictEqual(network.calls(), 1);
  });
});
