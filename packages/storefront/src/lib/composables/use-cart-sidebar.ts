import { ref, computed, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import config from '@cloudcommerce/config';
import { fetchModule, availableExtraDiscount } from '@@sf/state/modules-info';
import { shoppingCart, totalItems } from '@@sf/state/shopping-cart';
import { getPriceWithDiscount } from '@@sf/composables/use-prices';
import { utm, sessionCoupon } from '@@sf/scripts/session-utm';

export type Props = {
  canAutoLoadDiscounts?: boolean;
}

export const useCartSidebar = (props: Props = {}) => {
  const { lang } = config.get();
  const { canAutoLoadDiscounts = true } = props;
  const coupon = ref<string | null>(sessionCoupon);
  const isLoadingDiscount = ref(false);
  const amountDiscount = ref(0);
  const discountLabel = ref('');
  const discountedSubtotal = computed(() => {
    if (amountDiscount.value) {
      return shoppingCart.subtotal - amountDiscount.value;
    }
    const discount = availableExtraDiscount.value;
    if (discount) {
      return getPriceWithDiscount(shoppingCart.subtotal, discount);
    }
    return shoppingCart.subtotal;
  });
  let discountLoadId = 0;
  const debouncedLoadDiscounts = useDebounceFn(async () => {
    const execId = Date.now();
    discountLoadId = execId;
    try {
      const response = await fetchModule('apply_discount', {
        method: 'POST',
        body: {
          domain: globalThis.location?.hostname,
          lang,
          utm,
          discount_coupon: coupon.value !== null ? coupon.value : undefined,
          amount: {
            discount: 0,
            subtotal: shoppingCart.subtotal,
            total: shoppingCart.subtotal,
          },
          items: shoppingCart.items,
        },
      });
      if (execId !== discountLoadId) return;
      if (response.ok) {
        const data = await response.json();
        amountDiscount.value = 0;
        data.result.forEach(({ response: appRes }) => {
          if (appRes?.discount_rule) {
            amountDiscount.value += appRes.discount_rule.extra_discount.value;
            discountLabel.value = appRes.discount_rule.label || '';
          } else {
            amountDiscount.value = 0;
          }
        });
      }
    } catch {
      if (execId !== discountLoadId) return;
    }
    isLoadingDiscount.value = false;
  }, 400);
  const loadDiscounts = () => {
    isLoadingDiscount.value = true;
    debouncedLoadDiscounts();
  };
  if (!import.meta.env.SSR && canAutoLoadDiscounts) {
    watch(shoppingCart, async () => {
      amountDiscount.value = 0;
      if (totalItems.value < 2 && !coupon.value) return;
      loadDiscounts();
    }, {
      immediate: true,
    });
    watch(coupon, async (newCoupon, oldCoupon) => {
      if (oldCoupon === undefined && !newCoupon) return;
      amountDiscount.value = 0;
      loadDiscounts();
    }, {
      immediate: true,
    });
  }

  const hasShippingCalculator = ref(false);
  const isShippingOpenOnce = ref(false);
  const unwatchShippingCalculator = watch(hasShippingCalculator, () => {
    if (!hasShippingCalculator.value) return;
    unwatchShippingCalculator();
    isShippingOpenOnce.value = true;
  });
  const amountFreight = ref<number | null>(null);
  const amountTotal = computed(() => {
    if (amountFreight.value === null) return null;
    return discountedSubtotal.value + amountFreight.value;
  });

  return {
    coupon,
    isLoadingDiscount,
    amountDiscount,
    discountLabel,
    discountedSubtotal,
    loadDiscounts,
    amountFreight,
    amountTotal,
  };
};

export default useCartSidebar;
