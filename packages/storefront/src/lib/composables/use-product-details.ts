import type { ResourceId, Products } from '@cloudcommerce/api/types';
import type { SectionPreviewProps } from '@@sf/state/use-cms-preview';
import {
  ref,
  computed,
  reactive,
  watch,
  toRef,
  onMounted,
} from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import { inStock as checkInStock } from '@ecomplus/utils';
import { type KitItem, useProductCard } from '@@sf/composables/use-product-card';

export type Props = Partial<SectionPreviewProps> & {
  product: Products;
  variationId?: ResourceId | null;
  canUseUrlParams?: boolean;
}

export type KitCompositionItem = {
  /** Index on product `kit_composition`, also the key for variation selections */
  index: number;
  productId: ResourceId;
  /** Units of this item on each kit pack */
  quantity: number;
  /** Product body, `null` while kit items are still loading */
  product: KitItem | null;
  /** Selectable variations, empty when the kit fixes the variation itself */
  variations: Exclude<Products['variations'], undefined>;
  variationId: ResourceId | null;
  isSelected: boolean;
  isInStock: boolean;
};

export const useProductDetails = (props: Props) => {
  const { canUseUrlParams = true } = props;
  const {
    product,
    title,
    isActive,
    kitItems,
    isLoadingKitItems,
    loadKitItems,
    loadToCart,
    isFailedToCart,
  } = useProductCard<Products>(props);
  const quantity = ref(product.min_quantity || 1);
  const hasSkuSelectionAlert = ref(false);
  const variationId = ref<ResourceId | null>(props.variationId || null);

  watch(toRef(props.variationId), () => {
    if (props.variationId === undefined) return;
    variationId.value = props.variationId;
  });
  if (canUseUrlParams) {
    const params = useUrlSearchParams('history');
    watch(variationId, (_variationId) => {
      if (_variationId) {
        params.var = _variationId;
        hasSkuSelectionAlert.value = false;
      }
    });
    onMounted(() => {
      watch(params, ({ var: variation }) => {
        if (typeof variation === 'string' && variation) {
          variationId.value = variation as ResourceId;
        }
      }, { immediate: true });
    });
  }

  const isKit = computed(() => Boolean(product.kit_composition?.length));
  const kitVariationIds = reactive<Array<ResourceId | null>>([]);
  onMounted(() => {
    if (isKit.value) loadKitItems();
  });
  const kitComposition = computed<KitCompositionItem[]>(() => {
    if (!product.kit_composition?.length) return [];
    return product.kit_composition.map((composition, index) => {
      const { _id: productId, variation_id: fixedVariationId } = composition;
      const kitItem = kitItems.value?.find(({ _id }) => _id === productId) || null;
      const _variationId = fixedVariationId || kitVariationIds[index] || null;
      const variation = _variationId
        ? kitItem?.variations?.find(({ _id }) => _id === _variationId)
        : undefined;
      const variations = (!fixedVariationId && kitItem?.variations) || [];
      const quantityPerKit = composition.quantity || 1;
      return {
        index,
        productId,
        quantity: quantityPerKit,
        product: kitItem,
        variations,
        variationId: _variationId,
        isSelected: Boolean(!variations.length || _variationId),
        isInStock: !kitItem || (
          kitItem.available !== false
          && checkInStock({
            ...kitItem,
            ...variation,
            min_quantity: quantityPerKit * quantity.value,
          })
        ),
      };
    });
  });
  const selectKitVariation = (index: number, _variationId: ResourceId | null) => {
    kitVariationIds[index] = _variationId;
    if (kitComposition.value.every(({ isSelected }) => isSelected)) {
      hasSkuSelectionAlert.value = false;
    }
  };

  const isSkuSelected = computed(() => {
    if (isKit.value) {
      return kitComposition.value.every(({ isSelected }) => isSelected);
    }
    return Boolean(!product.variations?.length || variationId.value);
  });
  const checkVariation = (ev?: Event) => {
    if (!isSkuSelected.value) {
      if (ev) ev.preventDefault();
      hasSkuSelectionAlert.value = true;
    } else {
      hasSkuSelectionAlert.value = false;
    }
    return !hasSkuSelectionAlert.value;
  };

  const addToCart = () => {
    if (!checkVariation()) return null;
    return loadToCart(quantity.value, {
      variationId: variationId.value,
      kitVariationIds: isKit.value ? kitVariationIds : undefined,
    });
  };

  const shippedItems = reactive([{
    ...product,
    body_html: undefined,
    quantity: 1,
  }] as Array<Record<string, any>>);
  /* Kits are shipped as their composition items, the kit product itself
  usually has no weight/dimensions to calculate shipping with. */
  watch([quantity, kitComposition], () => {
    if (!isKit.value) {
      shippedItems[0].quantity = quantity.value;
      return;
    }
    const kitShippedItems = kitComposition.value.reduce((items, item) => {
      if (item.product) {
        items.push({
          ...item.product,
          body_html: undefined,
          variation_id: item.variationId || undefined,
          quantity: item.quantity * quantity.value,
        });
      }
      return items;
    }, [] as Array<Record<string, any>>);
    if (kitShippedItems.length) {
      shippedItems.splice(0, shippedItems.length, ...kitShippedItems);
    }
  }, { immediate: true });

  return {
    product,
    variationId,
    title,
    isActive,
    quantity,
    isSkuSelected,
    hasSkuSelectionAlert,
    checkVariation,
    addToCart,
    isFailedToCart,
    shippedItems,
    isKit,
    isLoadingKitItems,
    kitComposition,
    kitVariationIds,
    selectKitVariation,
  };
};

export default useProductDetails;
