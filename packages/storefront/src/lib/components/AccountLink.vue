<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

export interface Props {
  to?: 'orders' | 'favorites';
  accountUrl?: string;
  returnUrl?: string | null;
  isSignUp?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  accountUrl: globalThis.$storefront?.settings.accountUrl || '/app/account',
});
const locationUrl = ref('');
if (globalThis.location?.href) {
  nextTick(() => {
    locationUrl.value = globalThis.location.href;
  });
}
const href = computed(() => {
  let url = props.accountUrl;
  const returnUrl = props.returnUrl || locationUrl.value;
  if (!props.to) {
    if (props.isSignUp) {
      url += '?sign_up&';
    } else {
      url += '?';
    }
    return returnUrl ? `${url}return_url=${returnUrl}` : url;
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
