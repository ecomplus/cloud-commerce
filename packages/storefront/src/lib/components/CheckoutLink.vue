<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
  to?: 'cart' | 'checkout';
  cartUrl?: string;
  checkoutUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  to: 'cart',
  cartUrl: globalThis.$storefront.settings.cart_url || '/app/#/cart',
  checkoutUrl: globalThis.$storefront.settings.checkout_url || '/app/#/checkout',
});
const href = computed(() => {
  if (props.to === 'cart') return props.cartUrl;
  return props.checkoutUrl;
});
</script>

<template>
  <a :href="href"><slot /></a>
</template>