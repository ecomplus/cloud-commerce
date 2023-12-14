import type { SearchItem } from '@cloudcommerce/types';
import { watch, shallowReactive } from 'vue';
import { SearchEngine } from '@@sf/state/search-engine';

export interface Props {
  searchEngine?: InstanceType<typeof SearchEngine>;
  term?: string | null;
  params?: Record<string, any>;
  sort?: '-sales' | '-created_at' | 'price' | '-price' | '-price_discount' | string;
  products?: SearchItem[];
  ssrError?: string | null;
}

const useSearchContainer = (props: Props) => {
  let { term, searchEngine } = props;
  if (props.ssrError && !import.meta.env.SSR) {
    console.error(new Error(`SSR search error: ${props.ssrError}`));
    if (window.location.pathname.startsWith('/s/')) {
      window.location.href = `/s?q=${encodeURIComponent(term || '')}`;
    }
  }
  const products = shallowReactive<SearchItem[]>(props.products || []);
  if (!searchEngine) {
    searchEngine = new SearchEngine({ debounce: 50 });
    if (term === undefined && !import.meta.env.SSR) {
      term = new URLSearchParams(window.location.search).get('q') || null;
    }
    if (term !== undefined) {
      searchEngine.term.value = term;
    }
    if (props.params) {
      Object.assign(searchEngine.params, props.params);
    }
    if (props.sort) {
      searchEngine.params.sort = props.sort;
    }
  }
  if (!searchEngine.wasFetched.value && !props.products) {
    searchEngine.fetch().catch(console.error);
  }
  watch(searchEngine.products, () => {
    products.splice(0);
    searchEngine?.products.forEach((item) => products.push(item));
  });
  return {
    searchEngine,
    fetching: searchEngine.fetching.value,
    isFetching: searchEngine.isFetching,
    products,
  };
};

export default useSearchContainer;

export { useSearchContainer };
