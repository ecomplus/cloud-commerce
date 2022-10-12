<script lang="ts" setup>
import HeaderCartLink from '@@components/header/HeaderCartLink.vue';

export interface Props {
  cartUrl?: string;
}

defineProps<Props>();
</script>

<template>
  <HeaderCartLink :href="cartUrl" />
</template>
