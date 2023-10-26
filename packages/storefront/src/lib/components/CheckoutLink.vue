<script setup lang="ts">
import type { CartItem } from '@@sf/composables/use-cart-item';
import { computed } from 'vue';

export interface Props {
  to?: 'cart' | 'checkout';
  cartUrl?: string;
  checkoutUrl?: string;
  cartId?: CartItem['_id'];
  cartItem?: Partial<CartItem> & { product_id: CartItem['product_id'] };
}

const props = withDefaults(defineProps<Props>(), {
  to: 'cart',
  cartUrl: globalThis.$storefront?.settings.cartUrl || '/app/#/cart',
  checkoutUrl: globalThis.$storefront?.settings.checkoutUrl || '/app/#/checkout',
});
const href = computed(() => {
  let url = (props.to === 'cart') ? props.cartUrl : props.checkoutUrl;
  if (props.cartId) {
    url += `/${props.cartId}`;
  } else if (props.cartItem) {
    const params: Record<string, string> = {
      product_id: props.cartItem.product_id,
    };
    const {
      variation_id: variationId,
      quantity,
      sku,
      customizations,
    } = props.cartItem;
    if (variationId) params.variation_id = variationId;
    if (quantity) params.quantity = String(quantity);
    if (sku) params.sku = sku;
    if (customizations) {
      customizations.forEach(({ label, option, attachment }, i) => {
        const prefix = `customizations.${i}.`;
        if (label) params[prefix + 'label'] = label;
        if (option) {
          if (option._id) params[prefix + 'option._id'] = option._id;
          params[prefix + 'option.text'] = option.text;
        }
        if (attachment) params[prefix + 'attachment'] = attachment;
      });
    }
    url += '?' + new URLSearchParams(params).toString();
  }
  return url;
});
</script>

<template>
  <a :href="href"><slot /></a>
</template>
