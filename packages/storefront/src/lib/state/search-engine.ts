import type { SearchItem, SearchResult } from '@cloudcommerce/types';
import { ref, watch, shallowReactive } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import api from '@cloudcommerce/api';
import useStorage from '@@sf/state/use-storage';

const storageKey = 'ecomSeachHistory';

export const searchHistory = useStorage<string[]>(storageKey, []);

export const search = async ({
  term,
  params,
  fields,
  url = 'search/v1',
}: {
  term: string,
  params?: Record<string, any>,
  fields?: readonly string[],
  url?: 'search/v1' | `search/v1?${string}`,
}) => {
  term = term.trim();
  if (term.length < 2) {
    return { data: { result: [], meta: null } };
  }
  const response = await api.get(url, {
    fields,
    params: {
      ...params,
      term,
    },
  });
  if (response.data.result.length) {
    const termIndex = searchHistory.findIndex((_term) => term.startsWith(_term));
    if (termIndex > -1) {
      searchHistory.splice(termIndex, 1);
    }
    searchHistory.unshift(term);
    while (searchHistory.length > 20) {
      searchHistory.pop();
    }
  }
  return response;
};

export class SearchEngine {
  fields?: readonly string[];
  term = ref('');
  isWithCount = ref(true);
  isWithBuckets = ref(true);
  params = shallowReactive<Record<string, any>>({});
  pageSize = ref(24);
  pageNumber = ref(1);
  isFetching = ref(false);
  products = shallowReactive<SearchItem[]>([]);
  meta = shallowReactive<SearchResult<'v1'>['meta']>({
    offset: 0,
    limit: 0,
    fields: [],
    sort: [],
    query: {},
  });
  #search: ReturnType<typeof useDebounceFn<typeof search>>;
  constructor({
    fields,
    debounce = 150,
  }: {
    fields?: readonly string[],
    debounce?: number,
  } = {}) {
    this.fields = fields;
    this.#search = useDebounceFn(search, debounce);
    watch([this.term, this.params], () => {
      this.pageNumber.value = 1;
    });
  }

  async fetch(term?: string) {
    if (term && term !== this.term.value) {
      this.term.value = term;
      this.pageNumber.value = 1;
    }
    const limit = this.pageSize.value;
    const offset = limit * (this.pageNumber.value - 1);
    this.isFetching.value = true;
    const response = await this.#search({
      term: this.term.value,
      params: {
        ...this.params,
        limit,
        offset,
        count: this.isWithCount.value || undefined,
        buckets: this.isWithBuckets.value || undefined,
      },
      fields: this.fields,
    });
    this.isFetching.value = false;
    if (response) {
      const { data } = response;
      if (data.meta) {
        this.products.splice(0);
        Object.assign(this.meta, data.meta);
      }
      data.result.forEach((item) => this.products.push(item));
    }
  }
}

export default SearchEngine;
