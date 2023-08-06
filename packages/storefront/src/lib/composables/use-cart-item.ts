import type { Carts } from '@cloudcommerce/api/types';
import type { ProductItem } from '@@sf/composables/use-product-card';
import { computed } from 'vue';
import { name as getName, img as getImg } from '@ecomplus/utils';
import { parseProduct } from '@@sf/state/shopping-cart';

export type CartItem = Carts['items'][0];

export type Props = {
  item?: CartItem;
  product?: ProductItem;
  pictureSize?: string;
} & ({ item: CartItem } | { product: ProductItem });

export const useCartItem = (props: Props) => {
  const parsedItem = computed(() => {
    return !props.item && props.product
      ? parseProduct(props.product)
      : null;
  });
  const cartItem = computed(() => {
    return (props.item || parsedItem.value) as CartItem;
  });
  const title = computed(() => {
    return getName(cartItem);
  });
  const link = computed(() => {
    const { slug } = cartItem.value;
    if (typeof slug === 'string') {
      return `/${slug}`;
    }
    return null;
  });
  const image = computed(() => {
    if (cartItem.value.picture) {
      return getImg(cartItem.value.picture, undefined, props.pictureSize || 'small');
    }
    return undefined;
  });
  const finalPrice = computed(() => {
    return cartItem.value.final_price || cartItem.value.price;
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
