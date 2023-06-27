import type { Products, Carts, SearchItem } from '@cloudcommerce/types';
import { ref, computed, shallowReactive } from 'vue';
import api from '@cloudcommerce/api';
import {
  price as getPrice,
  name as getName,
  img as getImg,
  inStock as checkInStock,
  onPromotion as checkOnPromotion,
} from '@ecomplus/utils';

type CartItem = Carts['items'][0];
type ProductItem = Products | SearchItem | CartItem;
type PictureSize = Exclude<Exclude<Products['pictures'], undefined>[0]['normal'], undefined>;

export type Props = {
  product?: ProductItem;
  productId?: Products['_id'];
} & ({ product: ProductItem } | { productId: Products['_id'] });

const useProductCard = (props: Props) => {
  const isFetching = ref(false);
  let fetching: Promise<void> | null = null;
  const fetchError = ref<Error | null>(null);
  const product = shallowReactive<Partial<ProductItem> & { price: number }>({
    ...props.product,
    price: getPrice(props.product || {}),
  });
  const title = computed(() => {
    return getName(product);
  });
  const link = computed(() => {
    const { slug } = (product as SearchItem);
    if (typeof slug === 'string') {
      return `/${slug}`;
    }
    return null;
  });
  const images = computed(() => {
    const { pictures } = (product as Products);
    const _images: PictureSize[] = [];
    if (pictures) {
      pictures.forEach(((picture) => {
        const img = getImg(picture);
        if (img) _images.push(img);
      }));
    } else {
      const { picture } = (product as CartItem);
      if (picture) {
        const img = getImg(picture);
        if (img) _images.push(img);
      }
    }
    return _images;
  });
  const isInStock = computed(() => {
    return checkInStock(product);
  });
  const isActive = computed(() => {
    return isInStock.value
      && (product as SearchItem).available && (product as SearchItem).visible;
  });
  const discountPercentage = computed(() => {
    if (checkOnPromotion(product)) {
      const basePrice = (product as SearchItem).base_price as number;
      return Math.round(((basePrice - getPrice(product)) * 100) / basePrice);
    }
    return 0;
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
    isFetching,
    fetching,
    fetchError,
    product,
    title,
    link,
    images,
    isInStock,
    isActive,
    discountPercentage,
  };
};

export default useProductCard;

export { useProductCard };
