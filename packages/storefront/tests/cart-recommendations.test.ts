// @vitest-environment jsdom
/**
 * Recomendações de produtos no carrinho e checkout.
 * Prova o caminho completo: itens do carrinho -> Graphs API (`recommended` com
 * fallback para `related`) -> busca dos produtos por `_id` no `search/v1`.
 *
 * A regressão que motivou este módulo: o componente legado do storefront-app
 * buscava os produtos por `{terms: {_id: [...]}}` no `search/_els`, que hoje
 * responde 0 hits, deixando a vitrine sempre vazia e sem erro no console.
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

let graphsResponses: Record<string, string[]>;
let fetchCalls: string[];
let scope: ReturnType<typeof effectScope> | undefined;

// Cada instância vive no seu escopo para os watchers não vazarem entre os testes.
const setup = (props?: Parameters<typeof useCartRecommendations>[0]) => {
  scope = effectScope();
  return scope.run(() => useCartRecommendations(props))!;
};

// Deixa todas as promises pendentes (graphs + search) resolverem.
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
  test('não busca nada com o carrinho vazio', async () => {
    const { products, productIds } = setup();
    await flush();
    expect(fetchCalls).toHaveLength(0);
    expect(apiGet).not.toHaveBeenCalled();
    expect(productIds.value).toEqual([]);
    expect(products.value).toEqual([]);
  });

  test('busca os produtos recomendados por `_id` no search/v1', async () => {
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
    // ordenado pela relevância do grafo, não pela ordem da resposta da busca
    expect(products.value.map(({ name }) => name)).toEqual(['Segundo', 'Terceiro']);
  });

  test('cai para `related` quando `recommended` volta vazio', async () => {
    graphsResponses[`${A}/related`] = [B];
    apiGet.mockResolvedValue({ data: { result: [searchItem({ _id: B })] } });
    shoppingCart.items = [cartItem(A)];
    const { productIds } = setup();
    await flush();
    expect(fetchCalls.some((url) => url.includes('/recommended.json'))).toBe(true);
    expect(fetchCalls.some((url) => url.includes('/related.json'))).toBe(true);
    expect(productIds.value).toEqual([B]);
  });

  test('exclui itens já no carrinho e produtos indisponíveis ou sem estoque', async () => {
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

  test('usa os itens de maior quantidade como origem, limitado por maxSourceItems', async () => {
    graphsResponses[`${B}/recommended`] = [D];
    shoppingCart.items = [cartItem(A, 1), cartItem(B, 5), cartItem(C, 2)];
    setup({ maxSourceItems: 1 });
    await flush();
    expect(fetchCalls[0]).toContain(`/products/${B}/recommended.json`);
    expect(fetchCalls.every((url) => url.includes(`/products/${B}/`))).toBe(true);
  });

  test('respeita o gate de rota do /app/', async () => {
    graphsResponses[`${A}/recommended`] = [B];
    shoppingCart.items = [cartItem(A)];
    globalThis.location.hash = '#/confirmation/123';
    const { productIds } = setup({ onRoutes: ['cart', 'checkout'] });
    await flush();
    expect(fetchCalls).toHaveLength(0);
    expect(productIds.value).toEqual([]);
  });
});
