import type { Products, Carts, SearchItem } from '@cloudcommerce/types';
import { ref, computed, shallowReactive } from 'vue';
import api from '@cloudcommerce/api';
import {
  name as getName,
  price as getPrice,
  inStock as checkInStock,
  onPromotion as checkOnPromotion,
} from '@ecomplus/utils';

type ProductItem = Products | SearchItem | Carts['items'][0];

export type Props = {
  product?: ProductItem;
  productId?: Products['_id'];
} & ({ product: ProductItem } | { productId: Products['_id'] });

const useProductCard = (props: Props) => {
  const isFetching = ref(false);
  let fetching: Promise<void> | null = null;
  const fetchError = ref<Error | null>(null);
  const product = shallowReactive<Products | SearchItem | {}>(props.product || {});
  const title = computed(() => {
    return getName(product);
  });
  const price = computed(() => {
    return getPrice(product);
  });
  const discount = computed(() => {
    if (checkOnPromotion(product)) {
      const basePrice = (product as Products).base_price as number;
      return Math.round(((basePrice - price.value) * 100) / basePrice);
    }
    return 0;
  });
  const isInStock = computed(() => {
    return checkInStock(product);
  });
  const isActive = computed(() => {
    return isInStock.value
     && (product as Products).available && (product as Products).visible;
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
    price,
    discount,
    isInStock,
    isActive,
    isFetching,
    fetching,
    fetchError,
    product,
  };
};

export default useProductCard;

export { useProductCard };
