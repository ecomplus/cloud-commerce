import type { Config as ApiConfig, SearchResult } from '@cloudcommerce/api/types';
import {
  ref,
  computed,
  reactive,
  watch,
  shallowReactive,
} from 'vue';
import { useDebounceFn } from '@vueuse/core';
import api from '@cloudcommerce/api';
import useStorage from '@@sf/state/use-storage';

const storageKey = 'ecomSeachHistory';

export const searchHistory = useStorage<string[]>(storageKey, []);

for (let i = 0; i < searchHistory.length; i++) {
  if (typeof searchHistory[i] !== 'string') {
    searchHistory.splice(i, 1);
    i -= 1;
  }
}

export const search = async ({
  term,
  params,
  fields,
  url = 'search/v1',
}: {
  term: string | null,
  params?: Record<string, any>,
  fields?: readonly string[],
  url?: 'search/v1' | `search/v1?${string}`,
}) => {
  if (typeof term === 'string') {
    term = term.trim();
    if (term.length < 2) {
      return { data: { result: [], meta: null } };
    }
  }
  const response = await api.get(url, {
    fields,
    params: !term ? params : {
      ...params,
      term,
    },
  });
  if (term && response.data.result.length) {
    const termStr = term;
    const completeTermIndex = searchHistory.findIndex((_term) => {
      return _term.includes(termStr) && !(_term.replace(termStr, '')).includes(' ');
    });
    if (completeTermIndex > -1) {
      const completeTerm = searchHistory[completeTermIndex];
      searchHistory.splice(completeTermIndex, 1);
      searchHistory.unshift(completeTerm);
    } else {
      const termIndex = searchHistory.findIndex((_term) => termStr.startsWith(_term));
      if (termIndex > -1) {
        searchHistory.splice(termIndex, 1);
      }
      searchHistory.unshift(term);
    }
    while (searchHistory.length > 20) {
      searchHistory.pop();
    }
  }
  return response;
};

export class SearchEngine {
  fields?: readonly string[];
  term = ref<string | null>(null);
  isWithCount = ref(true);
  isWithBuckets = ref(true);
  params = reactive<Exclude<ApiConfig['params'], string | undefined>>({});
  pageSize = ref(24);
  pageNumber = ref(1);
  #middlewares: Array<(term?: string) => void> = [];
  #isFetching = ref(false);
  isFetching = computed(() => this.#isFetching.value);
  #wasFetched = ref(false);
  wasFetched = computed(() => this.#wasFetched.value);
  #fetching = ref<Promise<void> | null>(null);
  #fulfillFetching: (() => void) | undefined;
  fetching = computed(() => this.#fetching.value);
  #fetchError = ref<Error | null>(null);
  fetchError = computed(() => this.#fetchError.value);
  products = shallowReactive<SearchResult<'v1'>['result']>([]);
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
    this.#search = useDebounceFn((opts) => {
      this.#isFetching.value = true;
      return search(opts);
    }, debounce);
    watch([this.term, this.params, this.pageSize], () => {
      if (this.wasFetched.value) {
        this.pageNumber.value = 1;
        this.#wasFetched.value = false;
      }
    });
    watch(this.pageNumber, () => {
      this.#wasFetched.value = false;
    });
  }

  async fetch(term?: string) {
    if (term !== undefined && term !== this.term.value) {
      this.term.value = term;
      this.pageNumber.value = 1;
    }
    const limit = this.pageSize.value;
    const offset = limit * (this.pageNumber.value - 1);
    if (!this.#fetching.value) {
      this.#fetching.value = new Promise((resolve) => {
        this.#fulfillFetching = resolve;
      });
    }
    let response: Awaited<ReturnType<typeof search>> | null | undefined;
    try {
      for (let i = 0; i < this.#middlewares.length; i++) {
        this.#middlewares[i](term);
      }
      response = await this.#search({
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
    } catch (err: any) {
      if (this.#fulfillFetching) {
        this.#fetchError.value = err;
        this.#fulfillFetching();
      }
      throw err;
    }
    if (response) {
      this.#isFetching.value = false;
      this.#wasFetched.value = true;
      const { data } = response;
      if (data.meta) {
        this.setResult(data);
      }
      if (this.#fulfillFetching) {
        this.#fulfillFetching();
      }
    }
  }

  addMiddleware(cb: (term?: string) => void) {
    this.#middlewares.push(cb);
  }
  setResult(data: Partial<SearchResult<'v1'>>) {
    if (data.meta) {
      Object.assign(this.meta, data.meta);
    }
    if (data.result) {
      this.products.splice(0);
      data.result.forEach((item) => this.products.push(item));
    }
    if (data.meta && data.result) {
      /* nextTick */ setTimeout(() => {
        this.#wasFetched.value = true;
      }, 9);
    }
  }
}

export default SearchEngine;

export type SearchEngineInstance = InstanceType<typeof SearchEngine>;
