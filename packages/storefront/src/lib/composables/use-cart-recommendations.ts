import type { ResourceId, SearchItem } from '@cloudcommerce/types';
import type { CartSet } from '@cloudcommerce/api/types';
import {
  ref,
  shallowRef,
  computed,
  watch,
  onScopeDispose,
} from 'vue';
import api from '@cloudcommerce/api';
import { inStock as checkInStock } from '@ecomplus/utils';
import { SEARCH_ENGINE_DEFAULTS } from '@@sf/state/search-engine';
import { shoppingCart } from '@@sf/state/shopping-cart';

type CartItem = CartSet['items'][0];

export type MatchType = 'recommended' | 'related';

export type Props = {
  /** Graphs match types tried in order, stopping once `minIds` is reached. */
  matchTypes?: MatchType[];
  /** How many cart items (most quantity first) are used as recommendation sources. */
  maxSourceItems?: number;
  /** Stop trying further `matchTypes` once this many product IDs are found. */
  minIds?: number;
  /** Max product IDs sent to the search API. */
  maxIds?: number;
  /** Max products returned to render. */
  limit?: number;
  /**
   * Hash routes (`/app/#/cart` -> `cart`) where recommendations may show,
   * `null` (default) disables the route gate for regular storefront pages.
   */
  onRoutes?: string[] | null;
};

const GRAPHS_BASE_URI = 'https://apx-graphs.e-com.plus/api/v1';

const graphsCache: Record<string, Promise<ResourceId[]>> = {};

/** Drops the in-memory Graphs cache, mostly to keep tests isolated. */
export const clearRecommendationsCache = () => {
  Object.keys(graphsCache).forEach((cacheKey) => { delete graphsCache[cacheKey]; });
};

export const fetchRecommendedIds = async (
  productId: ResourceId,
  matchType: MatchType,
) => {
  const cacheKey = `${productId}/${matchType}`;
  if (!graphsCache[cacheKey]) {
    const fetching = (async () => {
      const storeId = globalThis.window?.ECOM_STORE_ID;
      const res = await fetch(`${GRAPHS_BASE_URI}/products/${productId}/${matchType}.json`, {
        headers: storeId ? { 'X-Store-ID': `${storeId}` } : undefined,
        signal: typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(5000)
          : undefined,
      });
      if (!res.ok) {
        throw new Error(`Graphs ${matchType} for ${productId} failed with ${res.status}`);
      }
      const { results } = await res.json();
      const rows: Array<{ row: ResourceId[] }> = results?.[0]?.data || [];
      return rows.map(({ row }) => row[0]).filter(Boolean);
    })();
    // Keep successful responses only, so a network blip may be retried later
    fetching.catch(() => { delete graphsCache[cacheKey]; });
    graphsCache[cacheKey] = fetching;
  }
  try {
    return await graphsCache[cacheKey];
  } catch (err) {
    console.error(err);
    return [] as ResourceId[];
  }
};

/**
 * On `/app/#/cart` and `/app/#/checkout` the cart is owned by the legacy
 * storefront-app (`window.ecomCart`), which writes to the same local storage key
 * but can't notify our reactive state within the same document.
 */
const legacyCartItems = shallowRef<CartItem[] | null>(null);
let isWatchingLegacyCart = false;

const watchLegacyCart = () => {
  if (isWatchingLegacyCart || import.meta.env.SSR) return;
  isWatchingLegacyCart = true;
  // `window.ecomCart` can only exist within the legacy storefront-app document,
  // skip polling for it on regular storefront pages
  if (!document.getElementById('storefront-app')) return;
  let tries = 0;
  const tryWatch = () => {
    const { ecomCart } = globalThis.window as Record<string, any>;
    if (!ecomCart) {
      tries += 1;
      // storefront-app is loaded async, give it some time to set the global up
      if (tries <= 50) setTimeout(tryWatch, 200);
      return;
    }
    const syncItems = () => {
      legacyCartItems.value = [...(ecomCart.data?.items || [])];
    };
    ecomCart.on('change', syncItems);
    syncItems();
  };
  tryWatch();
};

const hashRoute = ref('');
let isWatchingHashRoute = false;

const parseHashRoute = () => {
  hashRoute.value = (globalThis.location?.hash || '')
    .replace(/^#\/?/, '').split(/[/?]/)[0];
};

const watchHashRoute = () => {
  if (isWatchingHashRoute || import.meta.env.SSR) return;
  isWatchingHashRoute = true;
  parseHashRoute();
  globalThis.addEventListener('hashchange', parseHashRoute);
};

const useCartRecommendations = (props: Props = {}) => {
  const {
    matchTypes = ['recommended', 'related'],
    maxSourceItems = 3,
    minIds = 4,
    maxIds = 24,
    limit = 4,
    onRoutes = null,
  } = props;
  const productIds = ref<ResourceId[]>([]);
  const products = shallowRef<SearchItem[]>([]);
  const isFetching = ref(false);
  if (import.meta.env.SSR) {
    return { productIds, products, isFetching };
  }
  watchLegacyCart();
  if (onRoutes) watchHashRoute();
  const cartItems = computed(() => legacyCartItems.value || shoppingCart.items);
  const sourceIds = computed(() => {
    if (onRoutes && !onRoutes.includes(hashRoute.value)) return [];
    return [...cartItems.value]
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .map(({ product_id: productId }) => productId)
      .filter((productId, i, ids) => productId && ids.indexOf(productId) === i)
      .slice(0, maxSourceItems);
  });

  let execCount = 0;
  const fetchRecommendations = async (_sourceIds: ResourceId[]) => {
    execCount += 1;
    const execId = execCount;
    if (!_sourceIds.length) {
      productIds.value = [];
      products.value = [];
      // May be true from an older still pending execution, which won't reset
      // it on finish (see `execId` guards) since this exec took it over
      isFetching.value = false;
      return;
    }
    isFetching.value = true;
    const cartProductIds = cartItems.value.map(({ product_id: productId }) => productId);
    const ids: ResourceId[] = [];
    for (let i = 0; i < matchTypes.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const graphsIds = await Promise.all(_sourceIds.map((productId) => {
        return fetchRecommendedIds(productId, matchTypes[i]);
      }));
      if (execId !== execCount) return;
      graphsIds.forEach((_ids) => {
        _ids.forEach((productId) => {
          if (!cartProductIds.includes(productId) && !ids.includes(productId)) {
            ids.push(productId);
          }
        });
      });
      if (ids.length >= minIds) break;
    }
    productIds.value = ids.slice(0, maxIds);
    if (!productIds.value.length) {
      products.value = [];
      isFetching.value = false;
      return;
    }
    let endpointQuery = `_id=${productIds.value.join(',')}&limit=${maxIds}`;
    if (SEARCH_ENGINE_DEFAULTS.fields?.length) {
      endpointQuery += `&fields=${SEARCH_ENGINE_DEFAULTS.fields.join(',')}`;
    }
    try {
      const { data } = await api.get(`search/v1?${endpointQuery}`);
      if (execId !== execCount) return;
      products.value = (data.result as SearchItem[])
        .filter((item) => item.available && checkInStock(item))
        .sort((a, b) => productIds.value.indexOf(a._id) - productIds.value.indexOf(b._id))
        .slice(0, limit);
    } catch (err) {
      console.error(err);
      if (execId !== execCount) return;
      products.value = [];
    }
    isFetching.value = false;
  };

  const unwatch = watch(sourceIds, (_sourceIds, oldSourceIds) => {
    if (oldSourceIds && `${_sourceIds}` === `${oldSourceIds}`) return;
    fetchRecommendations(_sourceIds);
  }, { immediate: true });
  onScopeDispose(() => unwatch(), true);

  return { productIds, products, isFetching };
};

export default useCartRecommendations;

export { useCartRecommendations };
