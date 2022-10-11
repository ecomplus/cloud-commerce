<script lang="ts" setup>
import { i19myAccountAndOrders } from '@@i18n';
import HeaderLink from '@@components/header/HeaderLink.vue';

export interface Props {
  href?: string;
}

withDefaults(defineProps<Props>(), {
  href: '/app/account',
});
</script>

<template>
  <HeaderLink
    :href="href"
    :title="i19myAccountAndOrders"
  >
    <slot>
      <div class="i-user-circle"></div>
    </slot>
  </HeaderLink>
</template>
