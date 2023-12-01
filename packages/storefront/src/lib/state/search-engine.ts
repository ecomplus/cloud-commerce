import type { SearchItem } from '@cloudcommerce/types';
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
  if (response.data.result.length && !searchHistory.includes(term)) {
    const termIndex = searchHistory.findIndex((_term) => term.startsWith(_term));
    if (termIndex > -1) {
      searchHistory[termIndex] = term;
    } else {
      searchHistory.unshift(term);
    }
    while (searchHistory.length > 20) {
      searchHistory.pop();
    }
  }
  return response;
};

export class SearchEngine {
  url: 'search/v1' | `search/v1?${string}`;
  fields?: readonly string[];
  term = ref('');
  params = shallowReactive<Record<string, any>>({});
  pageSize = ref(24);
  pageNumber = ref(1);
  products = shallowReactive<SearchItem[]>([]);
  #search: ReturnType<typeof useDebounceFn<typeof search>>;
  constructor({
    fields,
    url = 'search/v1',
    debounce = 150,
  }: {
    fields?: readonly string[],
    url?: 'search/v1' | `search/v1?${string}`,
    debounce?: number,
  } = {}) {
    this.fields = fields;
    this.url = url;
    this.products = shallowReactive([]);
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
    const response = await this.#search({
      term: this.term.value,
      params: {
        limit,
        offset,
        ...this.params,
      },
      url: this.url,
      fields: this.fields,
    });
    const { data } = response;
    if (data.meta) {
      this.products.splice(0);
    }
    data.result.forEach((item) => this.products.push(item));
    return response;
  }
}

export default SearchEngine;
