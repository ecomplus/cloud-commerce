<script setup lang="ts">
import {
  ref,
  computed,
  nextTick,
  onMounted,
} from 'vue';
import { isLogged } from '@@sf/state/customer-session';

export type Props = {
  to?: 'orders' | 'favorites' | 'account';
  loginUrl?: string;
  returnUrl?: string | null;
  isSignUp?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loginUrl: '/app/account',
});
const locationUrl = ref('');
if (globalThis.location?.href) {
  nextTick(() => {
    locationUrl.value = globalThis.location.href;
  });
}
const isMounted = ref(false);
onMounted(() => { isMounted.value = true; });
const href = computed(() => {
  const returnUrl = props.returnUrl;
  const loggedTo = isMounted.value && isLogged.value
    ? (props.to || 'account')
    : null;
  if (!loggedTo) {
    let { loginUrl } = props;
    if (props.isSignUp) {
      loginUrl += '?sign_up&';
    } else {
      loginUrl += '?';
    }
    return returnUrl
      ? `${loginUrl}return_url=${returnUrl}`
      : `${loginUrl}#/account/${props.to || ''}`;
  }
  const { settings } = globalThis.$storefront;
  if (loggedTo === 'orders' && settings.ordersUrl) {
    return settings.ordersUrl;
  }
  if (loggedTo === 'favorites' && settings.favoritesUrl) {
    return settings.favoritesUrl;
  }
  if (loggedTo === 'account' && settings.accountUrl) {
    return settings.accountUrl;
  }
  return `/app/#/account/${loggedTo}`;
});
</script>

<template>
  <a :href="href"><slot /></a>
</template>
