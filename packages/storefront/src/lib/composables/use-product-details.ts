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
import { useProductCard } from '@@sf/composables/use-product-card';

export type Props = Partial<SectionPreviewProps> & {
  product: Products;
  variationId?: ResourceId | null;
  canUseUrlParams?: boolean;
}

export const useProductDetails = (props: Props) => {
  const { canUseUrlParams = true } = props;
  const {
    product,
    title,
    isActive,
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

  const isSkuSelected = computed(() => {
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
    if (!checkVariation()) return;
    loadToCart(quantity.value, { variationId: variationId.value });
  };

  const shippedItems = reactive([{
    ...product,
    body_html: undefined,
    quantity: 1,
  }]);
  watch(quantity, () => {
    shippedItems[0].quantity = quantity.value;
  });

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
  };
};

export default useProductDetails;
