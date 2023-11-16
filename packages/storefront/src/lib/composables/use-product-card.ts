import type { Products, SearchItem } from '@cloudcommerce/types';
import { ref, computed, shallowReactive } from 'vue';
import api from '@cloudcommerce/api';
import {
  price as getPrice,
  name as getName,
  img as getImg,
  inStock as checkInStock,
  onPromotion as checkOnPromotion,
} from '@ecomplus/utils';
import { emitGtagEvent, getGtagItem } from '@@sf/state/use-analytics';

type PictureSize = { url: string; alt?: string; size?: string };

export type ProductItem = Products | SearchItem;

export type Props = {
  product?: ProductItem;
  productId?: Products['_id'];
  listId?: string;
  listName?: string;
} & ({ product: ProductItem } | { productId: Products['_id'] });

const useProductCard = <T extends ProductItem | undefined = undefined>(props: Props) => {
  const isFetching = ref(false);
  let fetching: Promise<void> | null = null;
  const fetchError = ref<Error | null>(null);
  const { productId } = props;
  const product = shallowReactive<(T extends undefined ? Partial<SearchItem> : T)
    & { _id: Products['_id'], price: number }>({
      ...(props.product as Exclude<T, undefined>),
      _id: (props.product?._id || productId) as Products['_id'],
      price: getPrice(props.product || {}),
    });
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

  const title = computed(() => {
    return getName(product);
  });
  const link = computed(() => {
    const { slug } = (product as Products);
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
    }
    return _images;
  });
  const isInStock = computed(() => {
    return checkInStock(product);
  });
  const isActive = computed(() => {
    return isInStock.value
      && (product as Products).available && (product as Products).visible;
  });
  const discountPercentage = computed(() => {
    if (checkOnPromotion(product)) {
      const basePrice = (product as Products).base_price as number;
      return Math.round(((basePrice - getPrice(product)) * 100) / basePrice);
    }
    return 0;
  });
  const hasVariations = computed(() => {
    if ((product as SearchItem).has_variations) return true;
    return Boolean(product.variations?.length);
  });
  emitGtagEvent('view_item', {
    value: isActive.value ? product.price : 0,
    items: [{
      ...getGtagItem(product),
      item_list_id: props.listId,
      item_list_name: props.listName,
    }],
  });

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
    hasVariations,
  };
};

export default useProductCard;

export { useProductCard };
