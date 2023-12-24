import type { SearchItem } from '@cloudcommerce/types';
import type { SearchEngineInstance } from '@@sf/state/search-engine';
import { ref, watch, shallowReactive } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import {
  i19discount,
  i19highestPrice,
  i19lowestPrice,
  i19name,
  i19releases,
  i19relevance,
  i19sales,
} from '@@i18n';
import { SearchEngine } from '@@sf/state/search-engine';

export interface Props {
  term?: string | null;
  fixedParams?: SearchEngineInstance['params'];
  products?: SearchItem<null>[];
  resultMeta?: SearchEngineInstance['meta'];
  ssrError?: string | null;
  canUseUrlParams?: boolean;
}

const useSearchShowcase = (props: Props) => {
  let { term } = props;
  const canUseUrlParams = props.canUseUrlParams !== false;
  const urlParams = canUseUrlParams ? useUrlSearchParams('history') : null;
  if (props.ssrError && !import.meta.env.SSR) {
    console.error(new Error(`SSR search error: ${props.ssrError}`));
    if (window.location.pathname.startsWith('/s/')) {
      window.location.href = `/s?q=${encodeURIComponent(term || '')}`;
    }
  }
  const products = shallowReactive<SearchItem[]>(props.products || []);
  const searchEngine = new SearchEngine({ debounce: 50 });
  if (term === undefined && !import.meta.env.SSR) {
    term = new URLSearchParams(window.location.search).get('q') || null;
  }
  if (term !== undefined) {
    searchEngine.term.value = term;
  }
  Object.assign(searchEngine.params, props.fixedParams);
  if (urlParams) {
    Object.keys(urlParams).forEach((param) => {
      if (param === 'sort') {
        searchEngine.params.sort = urlParams.sort;
        return;
      }
      if (param === 'p') {
        const pageNumber = parseInt(String(urlParams.p), 10);
        if (pageNumber >= 1) searchEngine.pageNumber.value = pageNumber;
        return;
      }
      if (param.startsWith('f\\')) {
        const field = param.substring(2);
        searchEngine.params[field] = urlParams[param];
      }
    });
  }
  if (!searchEngine.wasFetched.value) {
    if (props.products || props.resultMeta) {
      searchEngine.setResult({
        result: props.products,
        meta: props.resultMeta,
      });
    }
    if (!props.products) {
      searchEngine.fetch().catch(console.error);
    }
  }
  searchEngine.isWithCount.value = true;
  searchEngine.isWithBuckets.value = true;
  const resultMeta = ref({
    count: 0,
    ...(props.resultMeta || searchEngine.meta),
  });
  watch(searchEngine.products, () => {
    products.splice(0);
    searchEngine.products.forEach((item) => products.push(item));
    resultMeta.value = {
      count: 0,
      ...searchEngine.meta,
    };
  });

  const sortOptions = [
    {
      value: null,
      label: i19relevance,
    }, {
      value: '-sales',
      label: i19sales,
    }, {
      value: 'price',
      label: i19lowestPrice,
    }, {
      value: '-price',
      label: i19highestPrice,
    }, {
      value: '-price_discount',
      label: i19discount,
    }, {
      value: '-created_at',
      label: i19releases,
    }, {
      value: 'name',
      label: i19name,
    },
  ];
  const sortOption = ref<string | null>(null);
  watch(sortOption, () => {
    searchEngine.params.sort = sortOption.value || undefined;
    searchEngine.fetch();
  });
  if (urlParams) {
    if (typeof urlParams.sort === 'string' && urlParams.sort) {
      sortOption.value = urlParams.sort;
    }
    watch(searchEngine.params, (params) => {
      Object.keys(urlParams).forEach((param) => {
        if (param.startsWith('f\\') || param === 'sort') {
          delete urlParams[param];
        }
      });
      Object.keys(params).forEach((param) => {
        if (props.fixedParams?.[param]) return;
        const val = params[param];
        if (val === undefined) return;
        switch (param) {
          case 'sort':
            urlParams.sort = String(val);
            return;
          case 'term':
          case 'limit':
          case 'offset':
          case 'count':
          case 'buckets':
          case 'fields':
            return;
          default:
        }
        if (typeof val === 'string' || typeof val === 'number') {
          urlParams[`f\\${param}`] = `${val}`;
          return;
        }
        if (Array.isArray(val) && typeof val[0] === 'string') {
          urlParams[`f\\${param}`] = val as string[];
        }
      });
    });
    watch(searchEngine.pageNumber, (pageNumber) => {
      urlParams.p = `${pageNumber}`;
    });
  }

  return {
    searchEngine,
    fetching: searchEngine.fetching.value,
    isFetching: searchEngine.isFetching,
    products,
    resultMeta,
    sortOptions,
    sortOption,
  };
};

export default useSearchShowcase;

export { useSearchShowcase };
