import type { SearchItem } from '@cloudcommerce/types';
import { ref, toRef } from 'vue';
import { watchDebounced } from '@vueuse/core';
import api from '@cloudcommerce/api';

export interface Props {
  term: string;
}

export const useSearchModal = (props: Props) => {
  const products = ref<SearchItem[]>([]);
  watchDebounced(toRef(props, 'term'), async (term) => {
    if (term) {
      products.value.splice(0);
      try {
        const { data } = await api.get('search/v1', { params: { term } });
        data.result.forEach((item) => products.value.push(item));
      } catch (err) {
        console.error(err);
      }
    }
  }, {
    immediate: true,
    debounce: 100,
    maxWait: 400,
  });
  return {
    products,
  };
};

export default useSearchModal;
