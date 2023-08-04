import type { Carts } from '@cloudcommerce/api/types';
import type { ProductItem } from '@@sf/composables/use-product-card';
import { computed, shallowReactive, watch } from 'vue';
import { name as getName, img as getImg } from '@ecomplus/utils';
import { parseProduct } from '@@sf/state/shopping-cart';

export type CartItem = Carts['items'][0];

export type Props = {
  item?: CartItem;
  product?: ProductItem;
  pictureSize?: string;
} & ({ item: CartItem } | { product: ProductItem });

export const useCartItem = (props: Props) => {
  const cartItem = shallowReactive({} as CartItem);
  watch(props, () => {
    if (props.item) {
      Object.assign(cartItem, props.item);
    } else if (props.product) {
      Object.assign(cartItem, parseProduct(props.product));
    }
  }, {
    immediate: true,
  });
  const title = computed(() => {
    return getName(cartItem);
  });
  const link = computed(() => {
    const { slug } = cartItem;
    if (typeof slug === 'string') {
      return `/${slug}`;
    }
    return null;
  });
  const image = computed(() => {
    if (cartItem.picture) {
      return getImg(cartItem.picture, undefined, props.pictureSize || 'small');
    }
    return undefined;
  });
  const finalPrice = computed(() => {
    return cartItem.final_price || cartItem.price;
  });
  return {
    cartItem,
    title,
    link,
    image,
    finalPrice,
  };
};

export default useCartItem;
