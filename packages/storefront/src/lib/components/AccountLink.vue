<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
  to?: 'orders' | 'favorites';
  accountUrl?: string;
  returnUrl?: string | null;
  isSignUp?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  accountUrl: globalThis.$storefront.settings.accountUrl || '/app/account',
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
    return props.returnUrl ? `${url}return_url=${props.returnUrl}` : url;
  }
  const { settings } = globalThis.$storefront;
  if (props.to === 'orders' && settings.ordersUrl) {
    return settings.ordersUrl;
  }
  if (props.to === 'favorites' && settings.favoritesUrl) {
    return settings.favoritesUrl;
  }
  return `${url}/${props.to}`;
});
</script>

<template>
  <a :href="href"><slot /></a>
</template>
