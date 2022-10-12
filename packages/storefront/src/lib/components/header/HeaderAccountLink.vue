<script lang="ts" setup>
import { i19myAccountAndOrders } from '@@i18n';
import HeaderButtonLink from '@@storefront/components/header/HeaderButtonLink.vue';

export interface Props {
  href?: string;
}

withDefaults(defineProps<Props>(), {
  href: '/app/account',
});
</script>

<template>
  <HeaderButtonLink
    :href="href"
    :title="i19myAccountAndOrders"
  >
    <slot>
      <div class="i-user-circle"></div>
    </slot>
  </HeaderButtonLink>
</template>
