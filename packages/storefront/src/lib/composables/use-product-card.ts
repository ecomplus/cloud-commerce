import type { ResourceId, Products, SearchItem } from '@cloudcommerce/types';
import { ref, computed, shallowReactive } from 'vue';
import api from '@cloudcommerce/api';
import { name as getName } from '@ecomplus/utils';

export type Props = {
  product?: Products | SearchItem;
  productId?: ResourceId;
} & ({ product: Products | SearchItem } | { productId: ResourceId });

const useProductCard = (props: Props) => {
  const isFetching = ref(false);
  let fetching: Promise<void> | null = null;
  const fetchError = ref<Error | null>(null);
  const product = shallowReactive<Products | SearchItem | {}>(props.product || {});
  const title = computed(() => {
    return getName(product);
  });

  const { productId } = props;
  if (!props.product && productId) {
    isFetching.value = true;
    fetching = (async () => {
      try {
        const { data } = await api.get(`products/${productId}`);
        Object.assign(product, data);
      } catch (err: any) {
        console.error(err);
        fetchError.value = err;
      }
      isFetching.value = false;
    })();
  }

  return {
    title,
    isFetching,
    fetching,
    fetchError,
    product,
  };
};

export default useProductCard;

export { useProductCard };
