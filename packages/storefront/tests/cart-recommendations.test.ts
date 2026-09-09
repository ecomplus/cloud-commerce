// @vitest-environment jsdom
/**
 * Product recommendations on cart and checkout.
 * Proves the full path: cart items -> Graphs API (`recommended` falling back
 * to `related`) -> products fetched by `_id` on `search/v1`.
 *
 * The regression which motivated this module: the legacy storefront-app
 * component fetched products with `{terms: {_id: [...]}}` on `search/_els`,
 * which responds 0 hits today, keeping the showcase always empty with no
 * console error.
 */
import {
  describe, test, expect, beforeEach, afterEach, vi,
} from 'vitest';
import { nextTick, reactive, effectScope } from 'vue';

const apiGet = vi.fn();
vi.mock('@cloudcommerce/api', () => ({
  default: { get: (...args: any[]) => apiGet(...args) },
}));

const shoppingCart = reactive<{ items: any[] }>({ items: [] });
vi.mock('@@sf/state/shopping-cart', () => ({ shoppingCart }));

const {
  useCartRecommendations,
  fetchRecommendedIds,
  clearRecommendationsCache,
} = await import('@@sf/composables/use-cart-recommendations');

const graphRows = (ids: string[]) => ({
  results: [{ columns: ['products.id'], data: ids.map((id) => ({ row: [id], meta: [null] })) }],
});

const searchItem = (over: Record<string, any> = {}) => ({
  _id: over._id || 'p00000000000000000000001',
  name: over.name || 'Produto',
  available: true,
  quantity: 10,
  price: 19.9,
  ...over,
});

const cartItem = (productId: string, quantity = 1) => ({
  _id: `i${productId.slice(1)}`,
  product_id: productId,
  quantity,
  price: 10,
});

const A = 'a00000000000000000000001';
const B = 'b00000000000000000000002';
const C = 'c00000000000000000000003';
const D = 'd00000000000000000000004';
const E = 'e00000000000000000000005';

let graphsResponses: Record<string, string[]>;
let fetchCalls: string[];
let scope: ReturnType<typeof effectScope> | undefined;

// Each instance lives on its own scope so watchers don't leak between tests.
const setup = (props?: Parameters<typeof useCartRecommendations>[0]) => {
  scope = effectScope();
  return scope.run(() => useCartRecommendations(props))!;
};

// Let all pending promises (graphs + search) resolve.
const flush = async () => {
  for (let i = 0; i < 12; i++) {
    // eslint-disable-next-line no-await-in-loop
    await nextTick();
  }
};

beforeEach(() => {
  clearRecommendationsCache();
  apiGet.mockReset();
  shoppingCart.items = [];
  fetchCalls = [];
  graphsResponses = {};
  globalThis.location.hash = '';
  (globalThis as any).window.ECOM_STORE_ID = 1011;
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    fetchCalls.push(url);
    const key = url.replace(/^.+\/products\//, '').replace('.json', '');
    const ids = graphsResponses[key];
    if (!ids) return { ok: true, json: async () => graphRows([]) };
    return { ok: true, json: async () => graphRows(ids) };
  }));
  apiGet.mockResolvedValue({ data: { result: [] } });
});

afterEach(() => {
  scope?.stop();
  scope = undefined;
  vi.unstubAllGlobals();
});

describe('useCartRecommendations', () => {
  test('fetches nothing with an empty cart', async () => {
    const { products, productIds } = setup();
    await flush();
    expect(fetchCalls).toHaveLength(0);
    expect(apiGet).not.toHaveBeenCalled();
    expect(productIds.value).toEqual([]);
    expect(products.value).toEqual([]);
  });

  test('fetches recommended products by `_id` on search/v1', async () => {
    graphsResponses[`${A}/recommended`] = [B, C];
    apiGet.mockResolvedValue({
      data: { result: [searchItem({ _id: C, name: 'Terceiro' }), searchItem({ _id: B, name: 'Segundo' })] },
    });
    shoppingCart.items = [cartItem(A)];
    const { products, productIds } = setup();
    await flush();
    expect(productIds.value).toEqual([B, C]);
    const [endpoint] = apiGet.mock.calls[0];
    expect(endpoint).toContain('search/v1?');
    expect(endpoint).toContain(`_id=${B},${C}`);
    // sorted by graph relevance, not by search response order
    expect(products.value.map(({ name }) => name)).toEqual(['Segundo', 'Terceiro']);
  });

  test('falls back to `related` when `recommended` comes empty', async () => {
    graphsResponses[`${A}/related`] = [B];
    apiGet.mockResolvedValue({ data: { result: [searchItem({ _id: B })] } });
    shoppingCart.items = [cartItem(A)];
    const { productIds } = setup();
    await flush();
    expect(fetchCalls.some((url) => url.includes('/recommended.json'))).toBe(true);
    expect(fetchCalls.some((url) => url.includes('/related.json'))).toBe(true);
    expect(productIds.value).toEqual([B]);
  });

  test('skips `related` once `recommended` reaches `minIds`', async () => {
    graphsResponses[`${A}/recommended`] = [B, C, D, E];
    shoppingCart.items = [cartItem(A)];
    const { productIds } = setup();
    await flush();
    expect(productIds.value).toEqual([B, C, D, E]);
    expect(fetchCalls.some((url) => url.includes('/related.json'))).toBe(false);
  });

  test('excludes items already in cart and unavailable or out of stock products', async () => {
    graphsResponses[`${A}/recommended`] = [B, C, D];
    graphsResponses[`${A}/related`] = [B, C, D];
    apiGet.mockResolvedValue({
      data: {
        result: [
          searchItem({ _id: C, name: 'Sem estoque', quantity: 0 }),
          searchItem({ _id: D, name: 'Indisponível', available: false }),
        ],
      },
    });
    shoppingCart.items = [cartItem(A), cartItem(B)];
    const { productIds, products } = setup();
    await flush();
    expect(productIds.value).not.toContain(B);
    expect(products.value).toEqual([]);
  });

  test('uses highest quantity items as sources, limited by maxSourceItems', async () => {
    graphsResponses[`${B}/recommended`] = [D];
    shoppingCart.items = [cartItem(A, 1), cartItem(B, 5), cartItem(C, 2)];
    setup({ maxSourceItems: 1 });
    await flush();
    expect(fetchCalls[0]).toContain(`/products/${B}/recommended.json`);
    expect(fetchCalls.every((url) => url.includes(`/products/${B}/`))).toBe(true);
  });

  test('respects the /app/ route gate', async () => {
    graphsResponses[`${A}/recommended`] = [B];
    shoppingCart.items = [cartItem(A)];
    globalThis.location.hash = '#/confirmation/123';
    const { productIds } = setup({ onRoutes: ['cart', 'checkout'] });
    await flush();
    expect(fetchCalls).toHaveLength(0);
    expect(productIds.value).toEqual([]);
  });

  test('resets `isFetching` when the cart is emptied mid-flight', async () => {
    let resolveGraphs!: (value: any) => void;
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      fetchCalls.push(url);
      return new Promise((resolve) => { resolveGraphs = resolve; });
    }));
    shoppingCart.items = [cartItem(A)];
    const { isFetching, products } = setup();
    await flush();
    expect(isFetching.value).toBe(true);
    shoppingCart.items = [];
    await flush();
    resolveGraphs({ ok: true, json: async () => graphRows([B]) });
    await flush();
    expect(isFetching.value).toBe(false);
    expect(products.value).toEqual([]);
    expect(apiGet).not.toHaveBeenCalled();
  });
});

describe('fetchRecommendedIds', () => {
  test('dedupes concurrent and repeated calls with in-memory cache', async () => {
    graphsResponses[`${A}/recommended`] = [B];
    const [ids1, ids2] = await Promise.all([
      fetchRecommendedIds(A as any, 'recommended'),
      fetchRecommendedIds(A as any, 'recommended'),
    ]);
    const ids3 = await fetchRecommendedIds(A as any, 'recommended');
    expect(ids1).toEqual([B]);
    expect(ids2).toEqual([B]);
    expect(ids3).toEqual([B]);
    expect(fetchCalls).toHaveLength(1);
  });

  test('degrades to empty list on Graphs API error, allowing retry later', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      fetchCalls.push(url);
      return { ok: false, status: 500, json: async () => ({}) };
    }));
    const ids = await fetchRecommendedIds(A as any, 'recommended');
    expect(ids).toEqual([]);
    // failed response must not be cached, so it can be retried
    graphsResponses[`${A}/recommended`] = [B];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      fetchCalls.push(url);
      return { ok: true, json: async () => graphRows(graphsResponses[`${A}/recommended`]) };
    }));
    const retriedIds = await fetchRecommendedIds(A as any, 'recommended');
    expect(retriedIds).toEqual([B]);
    expect(fetchCalls).toHaveLength(2);
    consoleError.mockRestore();
  });
});
