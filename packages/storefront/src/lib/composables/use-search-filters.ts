import type SearchEngineInstance from '@@sf/state/search-engine';
import { ref, computed, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { formatMoney, gridTitle as getGridTitle } from '@ecomplus/utils';
import {
  i19aboveOf,
  i19brands,
  i19categories,
  i19upTo,
} from '@@i18n';

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
    const paramKeys = Object.keys(activeFilters.value);
    const fields: string[] = [];
    paramKeys.forEach((key) => {
      const field = key.replace(/[^\w.]/g, '');
      if (!fields.includes(field)) {
        fields.push(field);
      }
    });
    return fields.length;
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
  let _lastParamChanged: null | string = null;
  const clearFilters = () => {
    Object.keys(searchEngine.params).forEach((param) => {
      if (fixedParams?.[param]) return;
      delete searchEngine.params[param];
    });
    _lastParamChanged = null;
  };

  const getPriceRangeKey = ({ min, max }: Partial<PriceRange>) => {
    return `${min || null}/${max || null}`;
  };
  const currentPriceRange = computed(() => {
    const { params } = searchEngine;
    return {
      min: Number(params['price>']),
      max: Number(params['price<']),
    };
  });
  const priceRanges = ref<Array<{ range: PriceRange, key: string }>>([]);
  const _updatePriceRanges = useDebounceFn(() => {
    priceRanges.value.splice(0);
    resultBuckets.value?.prices?.forEach((priceRange) => {
      if (priceRange.min) priceRange.min = Math.round(priceRange.min * 100) / 100;
      if (priceRange.max) priceRange.max = Math.round(priceRange.max * 100) / 100;
      priceRanges.value.push({
        range: priceRange,
        key: getPriceRangeKey(priceRange),
      });
    });
    if (!Number.isNaN(currentPriceRange.value.min)) {
      const checkedPriceRange = priceRanges.value.find(({ range }) => {
        return range.min === currentPriceRange.value.min
          && range.max === currentPriceRange.value.max;
      });
      if (!checkedPriceRange) {
        priceRanges.value.unshift({
          range: {
            ...currentPriceRange.value,
            count: resultMeta.value.count || 0,
            avg: null,
          },
          key: getPriceRangeKey(currentPriceRange.value),
        });
      }
    }
  }, 50);
  _updatePriceRanges();
  const priceRangeKey = ref<string | null>(getPriceRangeKey(currentPriceRange.value));
  watch(priceRangeKey, () => {
    _lastParamChanged = 'price';
    const priceRange = priceRanges.value.find(({ range }) => {
      return getPriceRangeKey(range) === priceRangeKey.value;
    });
    if (priceRange) {
      const { min, max } = priceRange.range;
      if (min) {
        searchEngine.params['price>'] = min;
      } else {
        delete searchEngine.params['price>'];
      }
      if (max) {
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
    if (min && max) {
      if (max === min) {
        return formatMoney(max);
      }
      return `${formatMoney(min)} ${i19upTo.toLowerCase()} ${formatMoney(max)}`;
    }
    if (!min && max) {
      return `${i19upTo} ${formatMoney(max)}`;
    }
    return `${i19aboveOf} ${formatMoney(min || 0)}`;
  };

  const filterOptions = ref<Array<{
    title: string,
    options: { [value: string]: number },
    field: string,
  }>>([]);
  const _updateFilterOptions = useDebounceFn(() => {
    for (let i = 0; i < filterOptions.value.length; i++) {
      const { field } = filterOptions.value[i];
      if (field !== _lastParamChanged) {
        filterOptions.value.splice(i, 1);
        i -= 1;
      }
    }
    const buckets = resultBuckets.value;
    if (buckets) {
      [['brands', i19brands], ['categories', i19categories]]
        .forEach(([resource, title]) => {
          const field = `${resource}.name`;
          if (buckets[field] && _lastParamChanged !== field) {
            filterOptions.value.push({
              title,
              options: buckets[field],
              field,
            });
          }
        });
      if (buckets.specs) {
        const { grids } = globalThis.$storefront.data;
        Object.keys(buckets.specs).forEach((specAndVal) => {
          const [spec, value] = specAndVal.split(':');
          if (value && _lastParamChanged !== spec) {
            const title = getGridTitle(spec, grids || []);
            const field = `specs.${spec}`;
            let filterOption = filterOptions.value.find((_filterOption) => {
              return _filterOption.field === field;
            });
            if (!filterOption) {
              filterOption = { title, options: {}, field };
              filterOptions.value.push(filterOption);
            }
            filterOption.options[value] = buckets.specs![specAndVal];
          }
        });
      }
    }
  }, 50);
  _updateFilterOptions();
  const checkFilterOption = (field: string, value: string | number) => {
    const fieldParams = activeFilters.value[field];
    if (fieldParams === value) return true;
    // @ts-ignore
    if (Array.isArray(fieldParams) && fieldParams.includes(value)) return true;
    return false;
  };
  const toggleFilterOption = (field: string, value: string | number) => {
    _lastParamChanged = field;
    const isToActivate = !checkFilterOption(field, value);
    let fieldParams = searchEngine.params[field];
    if (!Array.isArray(fieldParams)) {
      fieldParams = [];
      searchEngine.params[field] = fieldParams;
    }
    if (isToActivate) {
      // @ts-ignore
      fieldParams.push(value);
    } else {
      for (let i = 0; i < fieldParams.length; i++) {
        if (fieldParams[i] === value) {
          fieldParams.splice(i, 1);
          break;
        }
      }
    }
  };
  watch(resultBuckets, () => {
    if (_lastParamChanged !== 'price') {
      _updatePriceRanges();
    }
    _updateFilterOptions();
  });

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
    filterOptions,
    checkFilterOption,
    toggleFilterOption,
  };
};

export default useSearchFilters;

export { useSearchFilters, useSearchActiveFilters };
