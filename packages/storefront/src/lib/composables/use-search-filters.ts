import type SearchEngineInstance from '@@sf/state/search-engine';
import { ref, computed, watch } from 'vue';
import { formatMoney } from '@ecomplus/utils';
import { i19aboveOf, i19upTo } from '@@i18n';

export interface Props {
  searchEngine: SearchEngineInstance;
  fixedParams?: SearchEngineInstance['params'];
}

type PriceRange = Exclude<
  Exclude<SearchEngineInstance['meta']['buckets'], undefined>['prices'],
  undefined
>[number];

const useSearchActiveFilters = ({ searchEngine, fixedParams }: Props) => {
  const activeFilters = computed<SearchEngineInstance['params']>(() => {
    const filters = {};
    Object.keys(searchEngine.params).forEach((param) => {
      if (fixedParams?.[param]) return;
      const val = searchEngine.params[param];
      if (val === undefined) return;
      switch (param) {
        case 'sort':
        case 'term':
        case 'limit':
        case 'offset':
        case 'count':
        case 'buckets':
        case 'fields':
          return;
        default:
      }
      filters[param] = val;
    });
    return filters;
  });
  const filtersCount = computed(() => {
    return Object.keys(activeFilters.value).length;
  });
  return { activeFilters, filtersCount };
};

const useSearchFilters = (props: Props) => {
  const { searchEngine, fixedParams } = props;
  const resultMeta = computed(() => searchEngine.meta);
  const resultBuckets = computed(() => searchEngine.meta.buckets);
  const { activeFilters, filtersCount } = useSearchActiveFilters(props);
  watch(searchEngine.params, () => {
    searchEngine.fetch();
  });
  const clearFilters = () => {
    Object.keys(searchEngine.params).forEach((param) => {
      if (fixedParams?.[param]) return;
      delete searchEngine.params[param];
    });
  };

  const getPriceRangeKey = ({ min, max }: PriceRange) => {
    return `${min}/${max}`;
  };
  const currentPriceRange = computed(() => {
    const { params } = searchEngine;
    return {
      min: Number(params['price>']),
      max: Number(params['price<']),
    };
  });
  const priceRanges = computed(() => {
    return resultBuckets.value?.prices?.map((priceRange) => ({
      range: priceRange,
      key: getPriceRangeKey(priceRange),
    }));
  });
  const priceRangeKey = ref<string | null>(null);
  watch(priceRangeKey, () => {
    const priceRange = resultBuckets.value?.prices?.find((_range) => {
      return getPriceRangeKey(_range) === priceRangeKey.value;
    });
    if (priceRange) {
      let { min, max } = priceRange;
      if (!max) max = currentPriceRange.value.max;
      if (!min) min = currentPriceRange.value.min;
      if (min) {
        searchEngine.params['price>'] = min;
      } else {
        delete searchEngine.params['price>'];
      }
      if (max && (!min || max > min)) {
        searchEngine.params['price<'] = max;
      } else {
        delete searchEngine.params['price<'];
      }
      return;
    }
    delete searchEngine.params['price>'];
    delete searchEngine.params['price<'];
  });
  const getPriceRangeLabel = ({ min, max }: PriceRange) => {
    if (!max) max = currentPriceRange.value.max;
    if (!min) min = currentPriceRange.value.min;
    if (!min) {
      return `${i19upTo} ${formatMoney(max)}`;
    }
    if (max && max > min) {
      return `${formatMoney(min)} ${i19upTo.toLowerCase()} ${formatMoney(max)}`;
    }
    return `${i19aboveOf} ${formatMoney(min)}`;
  };

  return {
    resultMeta,
    resultBuckets,
    activeFilters,
    filtersCount,
    clearFilters,
    getPriceRangeKey,
    priceRanges,
    priceRangeKey,
    getPriceRangeLabel,
  };
};

export default useSearchFilters;

export { useSearchFilters, useSearchActiveFilters };
