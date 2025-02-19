import type {
  ResourceId,
  Products,
  ProductsList,
  SearchItem,
  ResourceListResult,
} from '@cloudcommerce/api/types';
import {
  ref,
  computed,
  shallowReactive,
  watch,
} from 'vue';
import api from '@cloudcommerce/api';
import { useDebounceFn } from '@vueuse/core';
import {
  price as getPrice,
  name as getName,
  img as getImg,
  inStock as checkInStock,
  onPromotion as checkOnPromotion,
} from '@ecomplus/utils';
import { slugify } from '@@sf/sf-lib';
import { addProductToCart } from '@@sf/state/shopping-cart';
import { emitGtagEvent, getGtagItem } from '@@sf/state/use-analytics';

const idsToStockRefetch: string[] = [];
const productStockFields = [
  'price' as const,
  'base_price' as const,
  'quantity' as const,
  'min_quantity' as const,
];
const freshStocks = ref<
  ResourceListResult<'products', typeof productStockFields>['result']
>([]);
const refetchStock = useDebounceFn(async () => {
  if (!idsToStockRefetch.length) return;
  try {
    const { data } = await api.get('products', {
      params: { _id: idsToStockRefetch },
      fields: productStockFields,
    });
    freshStocks.value = data.result;
  } catch (err) {
    console.error(err);
  }
}, 1200);

type PictureSize = { url: string; alt?: string; size?: string };

export type ProductItem = Products | SearchItem;

export const kitItemFields = [
  'sku' as const,
  'name' as const,
  'slug' as const,
  'available' as const,
  'price' as const,
  'quantity' as const,
  'pictures.normal' as const,
];

export type KitItems = ProductsList<typeof kitItemFields>;

export type Props = {
  product?: ProductItem & { __ssr?: boolean };
  productId?: ResourceId;
  listName?: string;
  listId?: string;
  isSkipStockRefetch?: boolean;
};

const useProductCard = <T extends ProductItem | undefined = undefined>(props: Props) => {
  const isFetching = ref(false);
  let fetching: Promise<void> | null = null;
  const fetchError = ref<Error | null>(null);
  const { productId } = props;
  const isProductPage = props.product
    && (props.product._id === globalThis.$storefront.apiContext?.doc._id);
  const shouldRefetchStock = !import.meta.env.SSR && !props.isSkipStockRefetch
    && (props.product?.__ssr || isProductPage);
  if (!import.meta.env.SSR && props.product?.__ssr !== undefined) {
    delete props.product.__ssr;
  }
  const product = shallowReactive<(T extends undefined ? Partial<SearchItem> : T)
    & { _id: Products['_id'], price: number }>({
      ...(props.product as Exclude<T, undefined>),
      _id: (props.product?._id || productId) as ResourceId,
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
  if (shouldRefetchStock) {
    idsToStockRefetch.push(product._id);
    refetchStock();
    const unwatchStocks = watch(freshStocks, (result) => {
      const productStock = result.find(({ _id }) => _id === product._id);
      if (!productStock) return;
      Object.assign(product, productStock);
      unwatchStocks();
    });
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
  emitGtagEvent(isProductPage ? 'view_item' : 'view_item_list', {
    value: isActive.value ? product.price : 0,
    items: [{
      ...getGtagItem(product),
      item_list_name: props.listName,
      item_list_id: props.listId || (props.listName && slugify(props.listName)),
    }],
  });

  const kitItems = ref<KitItems | null>(null);
  const loadKitItems = async () => {
    const kitComposition = product.kit_composition;
    if (kitComposition?.length) {
      const { data } = await api.get('products', {
        params: { _id: kitComposition.map(({ _id }) => _id) },
        fields: kitItemFields,
      });
      kitItems.value = data.result;
      let maxKitQnt = product.quantity || 1;
      for (let i = 0; i < kitItems.value.length; i++) {
        const kitItem = kitItems.value[i];
        if (!kitItem.quantity) {
          maxKitQnt = 0;
          break;
        }
        const compositionQnt = kitComposition
          .find(({ _id }) => _id === kitItem._id)?.quantity || 1;
        const maxKitQntByItem = Math.floor(kitItem.quantity / compositionQnt);
        if (maxKitQntByItem > maxKitQnt) {
          maxKitQnt = maxKitQntByItem;
        }
      }
      product.quantity = maxKitQnt;
    }
  };
  const isLoadingToCart = ref(false);
  const isFailedToCart = ref(false);
  const loadToCart = async (
    quantityToAdd = 1,
    { variationId }: {
      variationId?: ResourceId | null,
    } = {},
  ) => {
    isLoadingToCart.value = true;
    const addedCartItems = await (async () => {
      await fetching;
      if (hasVariations.value && !variationId) return [null];
      const kitComposition = product.kit_composition;
      if (kitComposition?.length) {
        if (variationId) return [null];
        if (!kitItems.value) await loadKitItems();
        if (kitItems.value?.length !== kitComposition.length) {
          return [null];
        }
        for (let i = 0; i < kitComposition.length; i++) {
          const { _id, quantity } = kitComposition[i];
          const kitItem = kitItems.value.find((item) => item._id === _id);
          if (
            !kitItem?.available
            || !checkInStock(kitItem)
            || (quantity && kitItem.quantity! < quantity)
          ) {
            return [null];
          }
        }
        let packQuantity = 0;
        const cartKitComposition: Array<{ _id: ResourceId, quantity: number }> = [];
        kitComposition.forEach(({ _id, quantity }) => {
          const kitItemQuantity = (quantity || 1) * quantityToAdd;
          packQuantity += kitItemQuantity;
          cartKitComposition.push(({
            _id,
            quantity: kitItemQuantity,
          }));
        });
        return kitItems.value.map((kitItem) => {
          const { quantity } = cartKitComposition.find(({ _id }) => {
            return _id === kitItem._id;
          }) || {};
          if (!quantity) return null;
          const cartItem = addProductToCart(kitItem, undefined, quantity);
          if (cartItem) {
            cartItem.kit_product = {
              _id: product._id,
              name: product.name,
              price: product.price,
              pack_quantity: packQuantity,
              composition: cartKitComposition,
            };
          }
          return cartItem;
        });
      }
      return [addProductToCart(product, variationId || undefined, quantityToAdd)];
    })();
    isLoadingToCart.value = false;
    isFailedToCart.value = !addedCartItems.some((item) => item);
    return addedCartItems;
  };

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
    kitItems,
    loadKitItems,
    loadToCart,
    isLoadingToCart,
    isFailedToCart,
  };
};

export default useProductCard;

export { useProductCard };
