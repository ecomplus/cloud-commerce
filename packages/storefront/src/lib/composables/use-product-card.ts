import type {
  ResourceId,
  Products,
  ProductsList,
  SearchItem,
  ResourceListResult,
} from '@cloudcommerce/api/types';
import type { ExtendedCartItem } from '@@sf/state/shopping-cart';
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
import {
  addCartItem,
  addProductToCart,
  parseProduct,
} from '@@sf/state/shopping-cart';
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
  'visible' as const,
  'price' as const,
  'base_price' as const,
  'quantity' as const,
  'min_quantity' as const,
  'pictures.normal' as const,
  'variations' as const,
];

export type KitItems = ProductsList<typeof kitItemFields>;

export type KitItem = KitItems[number];

/**
 * Variation selected for each `kit_composition` entry, by composition index.
 * Entries with a fixed `variation_id` or without variations are ignored.
 */
export type KitVariationIds = Array<ResourceId | null | undefined>;

const getKitItemStock = (kitItem: KitItem, variationId?: ResourceId | null) => {
  const variation = variationId
    ? kitItem.variations?.find(({ _id }) => _id === variationId)
    : undefined;
  const quantity = variation?.quantity ?? kitItem.quantity;
  return typeof quantity === 'number' ? quantity : Infinity;
};

export type Props = {
  product?: ProductItem & { __ssr?: boolean };
  productId?: ResourceId;
  listName?: string;
  listId?: string;
  isSkipStockRefetch?: boolean;
  picturesSize?: string;
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
        const img = getImg(picture, undefined, props.picturesSize);
        if (img) _images.push(img);
      }));
    }
    return _images;
  });
  const isInStock = computed(() => {
    return checkInStock(product);
  });
  const isActive = computed(() => {
    return isInStock.value && (product as Products).available
      && (product as Products).visible;
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
  const isLoadingKitItems = ref(false);
  let loadingKitItems: Promise<void> | null = null;
  const loadKitItems = () => {
    const kitComposition = product.kit_composition;
    if (!kitComposition?.length) return Promise.resolve();
    if (loadingKitItems) return loadingKitItems;
    isLoadingKitItems.value = true;
    loadingKitItems = (async () => {
      const productIds: ResourceId[] = [];
      kitComposition.forEach(({ _id }) => {
        if (!productIds.includes(_id)) productIds.push(_id);
      });
      const { data } = await api.get('products', {
        params: { _id: productIds },
        fields: kitItemFields,
      });
      kitItems.value = data.result;
      /* Kit availability is bound to its least available item,
      so `quantity` must be the lowest number of packs any item can fill. */
      let maxKitQnt = Infinity;
      for (let i = 0; i < kitComposition.length; i++) {
        const { _id, quantity, variation_id: variationId } = kitComposition[i];
        const kitItem = data.result.find((item) => item._id === _id);
        if (!kitItem) {
          maxKitQnt = 0;
          break;
        }
        const itemStock = getKitItemStock(kitItem, variationId);
        const maxKitQntByItem = Math.floor(itemStock / (quantity || 1));
        if (maxKitQntByItem < maxKitQnt) {
          maxKitQnt = maxKitQntByItem;
        }
      }
      if (maxKitQnt !== Infinity) {
        product.quantity = typeof product.quantity === 'number'
          ? Math.min(product.quantity, maxKitQnt)
          : maxKitQnt;
      }
    })().catch((err) => {
      loadingKitItems = null;
      console.error(err);
    }).finally(() => {
      isLoadingKitItems.value = false;
    });
    return loadingKitItems;
  };

  const isLoadingToCart = ref(false);
  const isFailedToCart = ref(false);
  const loadToCart = async (
    quantityToAdd = 1,
    { variationId, kitVariationIds }: {
      variationId?: ResourceId | null,
      kitVariationIds?: KitVariationIds,
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
        const loadedKitItems = kitItems.value;
        if (!loadedKitItems?.length) return [null];
        let packQuantity = 0;
        const cartKitComposition: Array<{
          _id: ResourceId,
          variation_id?: ResourceId,
          quantity: number,
        }> = [];
        /* The same product may be repeated on kit composition (with distinct
        variations), items must be merged to a single cart item each. */
        const cartItemsByKey: Record<string, ExtendedCartItem> = {};
        for (let i = 0; i < kitComposition.length; i++) {
          const { _id, quantity } = kitComposition[i];
          const kitItem = loadedKitItems.find((item) => item._id === _id);
          if (!kitItem?.available || kitItem.visible === false) {
            return [null];
          }
          const kitItemVariationId = kitComposition[i].variation_id
            || kitVariationIds?.[i]
            || undefined;
          const variation = kitItemVariationId
            ? kitItem.variations?.find(({ _id: id }) => id === kitItemVariationId)
            : undefined;
          if (kitItem.variations?.length && !variation) {
            // Kit item with variations requires a selected (and valid) SKU
            return [null];
          }
          const kitItemQuantity = (quantity || 1) * quantityToAdd;
          if (!checkInStock({
            ...kitItem,
            ...variation,
            min_quantity: kitItemQuantity,
          })) {
            return [null];
          }
          packQuantity += kitItemQuantity;
          const compositionItem = cartKitComposition.find((item) => {
            return item._id === _id && item.variation_id === kitItemVariationId;
          });
          if (compositionItem) {
            compositionItem.quantity += kitItemQuantity;
          } else {
            cartKitComposition.push({
              _id,
              variation_id: kitItemVariationId,
              quantity: kitItemQuantity,
            });
          }
          const key = `${_id}:${kitItemVariationId || ''}`;
          if (cartItemsByKey[key]) {
            cartItemsByKey[key].quantity += kitItemQuantity;
          } else {
            cartItemsByKey[key] = parseProduct(kitItem, kitItemVariationId, kitItemQuantity);
          }
        }
        return Object.keys(cartItemsByKey).map((key) => {
          /* `kit_product` must be set before adding to cart, otherwise the new item
          may be merged with a matching (standalone) item already on cart. */
          return addCartItem({
            ...cartItemsByKey[key],
            kit_product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              pack_quantity: packQuantity,
              composition: cartKitComposition,
            },
          });
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
    isLoadingKitItems,
    loadKitItems,
    loadToCart,
    isLoadingToCart,
    isFailedToCart,
  };
};

export default useProductCard;

export { useProductCard };
