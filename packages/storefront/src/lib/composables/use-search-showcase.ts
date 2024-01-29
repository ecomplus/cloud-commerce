import type { Ref } from 'vue';
import type { SearchItem } from '@cloudcommerce/types';
import type { SearchEngineInstance } from '@@sf/state/search-engine';
import {
  ref,
  computed,
  watch,
  shallowReactive,
} from 'vue';
import { useUrlSearchParams, watchOnce } from '@vueuse/core';
import { isScreenLg, scrollToEl } from '@@sf/sf-lib';
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
import { useSearchActiveFilters } from '@@sf/composables/use-search-filters';

export interface Props {
  term?: string | null;
  fixedParams?: SearchEngineInstance['params'];
  products?: SearchItem<null>[];
  resultMeta?: SearchEngineInstance['meta'];
  ssrError?: string | null;
  canUseUrlParams?: boolean;
  showcase?: Ref<HTMLElement | null>;
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
  let hasChangedInitParams = false;
  if (urlParams) {
    Object.keys(urlParams).forEach((param) => {
      if (!urlParams[param]) return;
      if (param.startsWith('f\\')) {
        const field = param.substring(2);
        searchEngine.params[field] = urlParams[param];
        if (props.fixedParams?.[field] !== urlParams[param]) {
          hasChangedInitParams = true;
        }
        return;
      }
      if (param === 'sort') {
        searchEngine.params.sort = urlParams.sort;
        if (
          typeof urlParams.sort === 'string'
          && props.resultMeta?.sort?.length === 1
        ) {
          const { field, order } = props.resultMeta.sort[0];
          const fetchedSort = order ? field : `-${field}`;
          if (fetchedSort === urlParams.sort) return;
        }
        hasChangedInitParams = true;
        return;
      }
      if (param === 'p') {
        const pageNumber = parseInt(String(urlParams.p), 10);
        if (pageNumber >= 1) {
          searchEngine.pageNumber.value = pageNumber;
          if (props.resultMeta?.offset) {
            const { offset, limit } = props.resultMeta;
            const fetchedPage = Math.ceil(offset / limit);
            if (fetchedPage === pageNumber) return;
          }
          hasChangedInitParams = true;
        }
      }
    });
  }
  if (!searchEngine.wasFetched.value) {
    if ((props.products || props.resultMeta) && !hasChangedInitParams) {
      searchEngine.setResult({
        result: props.products,
        meta: props.resultMeta,
      });
    }
    if (!props.products || hasChangedInitParams) {
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

  const totalPages = computed(() => {
    const { count } = searchEngine.meta;
    if (!count || products.length < 2) return 1;
    return Math.ceil(count / searchEngine.pageSize.value);
  });
  watch(searchEngine.pageNumber, (pageNumber) => {
    if (urlParams) {
      urlParams.p = `${pageNumber}`;
    }
    searchEngine.fetch();
  });
  const startWatchingFetch = () => {
    watch(searchEngine.isFetching, (isFetching) => {
      const el = props.showcase?.value;
      if (!isFetching && el) {
        setTimeout(() => {
          scrollToEl(el, isScreenLg ? -25 : 0);
        }, 50);
      }
    });
  };
  if (searchEngine.wasFetched.value) {
    startWatchingFetch();
  } else {
    watchOnce(searchEngine.wasFetched, startWatchingFetch);
  }

  const { activeFilters, filtersCount } = useSearchActiveFilters({
    searchEngine,
    fixedParams: props.fixedParams,
  });
  if (urlParams) {
    watch(activeFilters, (params) => {
      if (urlParams) {
        Object.keys(urlParams).forEach((param) => {
          if (param.startsWith('f\\')) delete urlParams[param];
        });
      }
      Object.keys(params).forEach((param) => {
        const val = params[param];
        if (typeof val === 'string' || typeof val === 'number') {
          urlParams[`f\\${param}`] = `${val}`;
          return;
        }
        if (Array.isArray(val) && typeof val[0] === 'string') {
          urlParams[`f\\${param}`] = val as string[];
        }
      });
    });
  }
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
      delete urlParams.sort;
      if (params.sort) urlParams.sort = String(params.sort);
    });
  }

  return {
    searchEngine,
    fetching: searchEngine.fetching.value,
    isFetching: searchEngine.isFetching,
    products,
    resultMeta,
    totalPages,
    activeFilters,
    filtersCount,
    sortOptions,
    sortOption,
  };
};

export default useSearchShowcase;

export { useSearchShowcase };
