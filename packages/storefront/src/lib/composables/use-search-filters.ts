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
      const fixedParam = fixedParams?.[param];
      if (typeof fixedParam === 'string') return;
      if (Array.isArray(fixedParam) && fixedParam.length <= 1) return;
      const val = searchEngine.params[param];
      if (val === undefined) return;
      if (Array.isArray(val) && !val.length) return;
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
      if (field === 'specs' && Array.isArray(activeFilters.value[key])) {
        (activeFilters.value[key] as string[]).forEach((specAndVal) => {
          const [spec] = specAndVal.split(':');
          const specField = `specs.${spec}`;
          if (!fields.includes(specField)) {
            fields.push(specField);
          }
        });
        return;
      }
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
      if (fixedParams?.[param] !== undefined) return;
      delete searchEngine.params[param];
    });
    _lastParamChanged = null;
  };

  const currentPriceRange = computed(() => {
    const { params } = searchEngine;
    return {
      min: Number(params['price>']),
      max: Number(params['price<']),
    };
  });
  const getPriceRangeKey = (range: Partial<PriceRange> = currentPriceRange.value) => {
    return `${range.min || null}/${range.max || null}`;
  };
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
          key: getPriceRangeKey(),
        });
      }
    }
    // eslint-disable-next-line no-use-before-define
    priceRangeKey.value = getPriceRangeKey();
  }, 50);
  _updatePriceRanges();
  const priceRangeKey = ref<string | null>(getPriceRangeKey());
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
      if (field !== _lastParamChanged && fixedParams?.[field] === undefined) {
        filterOptions.value.splice(i, 1);
        i -= 1;
      }
    }
    const buckets = resultBuckets.value;
    if (buckets) {
      [['brands', i19brands], ['categories', i19categories]]
        .forEach(([resource, title]) => {
          const field = `${resource}.name`;
          const fixedParam = fixedParams?.[field];
          if (
            !buckets[field]
            || _lastParamChanged === field
            || filterOptions.value.find((filter) => filter.field === field)
            || typeof fixedParam === 'string'
          ) {
            return;
          }
          const options = { ...buckets[field] };
          if (Array.isArray(fixedParam)) {
            if (fixedParam.length <= 1) return;
            Object.keys(options).forEach((name) => {
              if (!(fixedParam as string[]).includes(name)) {
                delete options[name];
              }
            });
          }
          filterOptions.value.push({ title, options, field });
        });
      if (buckets.specs) {
        const { grids } = globalThis.$storefront.data;
        Object.keys(buckets.specs).forEach((specAndVal) => {
          const [spec, value] = specAndVal.split(':');
          if (value) {
            const field = `specs.${spec}`;
            if (
              _lastParamChanged === field
              || filterOptions.value.find((filter) => filter.field === field)
              || fixedParams?.[field] !== undefined
            ) {
              return;
            }
            const title = getGridTitle(spec, grids || []);
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
  const parseSpecsField = (field: string, value: string | number) => {
    const [, spec] = field.split('.');
    return ['specs,', `${spec}:${value}`];
  };
  const checkFilterOption = (field: string, value: string | number) => {
    if (field.startsWith('specs.')) {
      [field, value] = parseSpecsField(field, value);
    }
    const fieldParams = activeFilters.value[field];
    if (fieldParams === value) return true;
    return Array.isArray(fieldParams)
      && (fieldParams as string[]).includes(value as string);
  };
  const toggleFilterOption = (field: string, value: string | number) => {
    _lastParamChanged = field;
    if (field.startsWith('specs.')) {
      [field, value] = parseSpecsField(field, value);
    }
    const isToActivate = !checkFilterOption(field, value);
    let fieldParams = searchEngine.params[field];
    if (!Array.isArray(fieldParams)) {
      fieldParams = [];
      searchEngine.params[field] = fieldParams;
    }
    if (isToActivate) {
      (fieldParams as string[]).push(value as string);
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
    if (_lastParamChanged !== 'price') _updatePriceRanges();
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
