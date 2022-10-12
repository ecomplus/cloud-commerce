<script lang="ts" setup>
import { i19openCart } from '@@i18n';
import HeaderButtonLink from '@@components/header/HeaderButtonLink.vue';

export interface Props {
  href?: string;
}

withDefaults(defineProps<Props>(), {
  href: '/app/#/cart',
});
</script>

<template>
  <HeaderButtonLink
    :href="href"
    :title="i19openCart"
  >
    <slot>
      <div class="i-shopping-cart"></div>
    </slot>
  </HeaderButtonLink>
</template>
