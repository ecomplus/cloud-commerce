import type { Ref } from 'vue';
import type { SearchItem } from '@cloudcommerce/types';
import type { SearchEngineInstance } from '@@sf/state/search-engine';
import type { SectionPreviewProps } from '@@sf/state/use-cms-preview';
import type { CmsFields } from '@@sf/content';
import {
  ref,
  computed,
  watch,
  shallowReactive,
} from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import api from '@cloudcommerce/api';
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
import { emitGtagEvent } from '@@sf/state/use-analytics';
import { useSearchActiveFilters } from '@@sf/composables/use-search-filters';
import { productShelfCmsFields } from '@@sf/composables/use-product-shelf';

export type Props = Partial<SectionPreviewProps> & {
  term?: string | null;
  pageSize?: number;
  fixedParams?: SearchEngineInstance['params'];
  products?: Array<SearchItem<null> & { __ssr?: boolean }>;
  resultMeta?: SearchEngineInstance['meta'];
  ssrError?: string | null;
  canUseUrlParams?: boolean;
  showcase?: Ref<HTMLElement | null>;
  searchEngine?: SearchEngineInstance;
  canFetchTermsOnEmpty?: boolean;
}

export const searchShowcaseCmsFields = ({
  pageSize: {
    widget: 'number',
    value_type: 'int',
    label: { pt: 'Itens por página', en: 'Items per page' },
    default: 24,
  },
  term: {
    widget: 'string',
    label: { pt: 'Termo de busca fixado', en: 'Fixed search term' },
    hint: {
      pt: 'Deve ser mantido em branco para busca dinâmica ou vitrines de categorias/marcas',
      en: 'Must be left blank for dynamic search or category/brand showcases',
    },
    _nullable: true,
  },
  fixedParams: {
    widget: 'object',
    label: { pt: 'Parâmetros fixados', en: 'Fixed params' },
    hint: {
      pt: 'Provavelmente mantido em branco para busca dinâmica ou páginas de categorias/marcas',
      en: 'Probably left blank for dynamic search or category/brand pages',
    },
    fields: {
      sort: productShelfCmsFields.sort,
      'created_at>': {
        label: {
          pt: 'Filtro por data de criação',
          en: 'Filter by creation date',
        },
        hint: {
          pt: 'Número de dias anteriores à data corrente',
          en: 'Number of days before the current date',
        },
        widget: 'number',
        value_type: 'int',
        max: 0,
      },
      'price_discount>': {
        label: {
          pt: 'Filtro por múltiplo de desconto',
          en: 'Filter by discount multiple',
        },
        hint: {
          pt: '1.01 para produtos com pelo menos 1% de desconto',
          en: '1.01 for products with at least 1% discount',
        },
        widget: 'number',
        value_type: 'float',
        min: 1,
        max: 1.99,
        step: 0.01,
      },
      'categories.name': {
        label: { pt: 'Filtro por categorias', en: 'Filter by categories' },
        widget: 'select:categories:name',
        multiple: true,
      },
      'brands.name': {
        label: { pt: 'Filtro por marca', en: 'Filter by brand' },
        widget: 'select:brands:name',
        multiple: true,
      },
      'price>': {
        label: { pt: 'Filtro por preço mínimo', en: 'Filter by minimum price' },
        widget: 'number',
        value_type: 'float',
        min: 0,
      },
      'price<': {
        label: { pt: 'Filtro por preço máximo', en: 'Filter by maximum price' },
        widget: 'number',
        value_type: 'float',
        min: 0,
      },
    },
  },
}) as const satisfies CmsFields;

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
  const searchEngine = props.searchEngine || new SearchEngine({ debounce: 50 });
  if (term === undefined && !import.meta.env.SSR) {
    term = new URLSearchParams(window.location.search).get('q') || null;
  }
  if (term !== undefined) {
    searchEngine.term.value = term;
  }
  if (props.pageSize) {
    searchEngine.pageSize.value = props.pageSize;
  }
  const { fixedParams } = props;
  if (fixedParams) {
    Object.keys(fixedParams).forEach((field) => {
      const value = fixedParams[field];
      if (Array.isArray(value)) {
        searchEngine.params[field] = [...value] as string[];
        return;
      }
      searchEngine.params[field] = value;
    });
  }
  let hasChangedInitParams = false;
  if (urlParams) {
    Object.keys(urlParams).forEach((param) => {
      if (!urlParams[param]) return;
      if (param.startsWith('f\\')) {
        const field = param.substring(2);
        searchEngine.params[field] = urlParams[param];
        if (fixedParams?.[field] !== urlParams[param]) {
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
          if (props.resultMeta?.limit) {
            const { offset, limit } = props.resultMeta;
            const fetchedPage = offset ? Math.ceil(offset / limit) : 1;
            if (fetchedPage === pageNumber) return;
          }
          hasChangedInitParams = true;
        }
      }
    });
  }

  const popularTerms = ref<null | string[]>(null);
  const isEmptyResult = ref(false);
  const handleEmptyResult = async () => {
    isEmptyResult.value = true;
    if (import.meta.env.SSR) return;
    if (props.canFetchTermsOnEmpty !== false) {
      try {
        const { data } = await api.get('search/v1/history?limit=40');
        popularTerms.value = data.result.map(({ terms }) => {
          return terms.join(' ');
        });
      } catch (err) {
        console.error(err);
      }
    }
    if (term) {
      emitGtagEvent('c_search_empty', { search_term: term });
    }
  };
  if (!searchEngine.wasFetched.value) {
    if ((props.products || props.resultMeta) && !hasChangedInitParams) {
      searchEngine.setResult({
        result: props.products,
        meta: props.resultMeta,
      });
      if (!props.products?.length) {
        handleEmptyResult();
      }
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
  const hybridOnProductsChange = () => {
    products.splice(0);
    searchEngine.products.forEach((item: SearchItem & { __ssr?: boolean }) => {
      if (import.meta.env.SSR) item.__ssr = true;
      products.push(item);
    });
    resultMeta.value = {
      count: 0,
      ...searchEngine.meta,
    };
    if (!products.length) {
      handleEmptyResult();
    }
  };
  if (import.meta.env.SSR) {
    searchEngine.fetching.value?.then(hybridOnProductsChange);
  } else {
    watch(searchEngine.products, hybridOnProductsChange);
  }

  const totalPages = computed(() => {
    const { count } = searchEngine.meta;
    if (!count) {
      return Math.max(
        Math.ceil(products.length / searchEngine.pageSize.value),
        searchEngine.pageNumber.value,
      );
    }
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
    watch(searchEngine.wasFetched, startWatchingFetch, { once: true });
  }

  const {
    activeFilters,
    filtersCount,
  } = useSearchActiveFilters({ searchEngine, fixedParams });
  if (urlParams) {
    watch(activeFilters, (params) => {
      if (urlParams) {
        Object.keys(urlParams).forEach((param) => {
          if (param.startsWith('f\\')) delete urlParams[param];
        });
      }
      Object.keys(params).forEach((param) => {
        if (fixedParams?.[param] !== undefined) return;
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
    isEmptyResult,
    popularTerms,
  };
};

export default useSearchShowcase;

export { useSearchShowcase };
