import type { SearchItems } from '@cloudcommerce/types';
import { ref, computed } from 'vue';
import api from '@cloudcommerce/api';

export interface Props {
  collectionId: string | null;
  sort?: 'sales' | 'news' | 'lowest_price' | 'highest_price'
    | 'offers' | 'price_discount' | 'views';
  title?: string | null;
  isShuffle?: boolean;
  limit?: number;
  page?: number;
  products?: SearchItems;
}

const useProductShelf = (props: Props) => {
  const isFetching = ref(false);
  const fetching = ref<Promise<void> | null>(null);
  const fetchError = ref<Error | null>(null);
  const _products = ref<SearchItems>([]);
  const products = computed(() => {
    if (props.products) return props.products;
    return _products.value;
  });
  if (!props.products) {
    isFetching.value = true;
    fetching.value = api.get('search/v1')
      .then(({ data }) => {
        _products.value = data.result;
      })
      .catch((err) => {
        console.error(err);
        fetchError.value = err;
      })
      .finally(() => {
        isFetching.value = false;
      });
  }
  return {
    isFetching,
    fetching,
    fetchError,
    products,
  };
};

export default useProductShelf;

export { useProductShelf };
