<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
  to?: 'orders' | 'favorites';
  accountUrl?: string;
  returnUrl?: string;
  isSignUp?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  accountUrl: globalThis.$storefront.settings.account_url || '/app/account',
  returnUrl: globalThis.location?.href,
});
const href = computed(() => {
  let url = props.accountUrl;
  if (!props.to) {
    if (props.isSignUp) {
      url += '?sign_up&';
    } else {
      url += '?';
    }
    return `${url}return_url=${props.returnUrl}`;
  }
  const { settings } = globalThis.$storefront;
  if (props.to === 'orders' && settings.orders_url) {
    return settings.orders_url;
  }
  if (props.to === 'favorites' && settings.favorites_url) {
    return settings.favorites_url;
  }
  return `${url}/${props.to}`;
});
</script>

<template>
  <a :href="href"><slot /></a>
</template>
