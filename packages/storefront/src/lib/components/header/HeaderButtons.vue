<script lang="ts" setup>
import HeaderAccountButton from '@@components/header/HeaderAccountButton.vue';
</script>

<template>
  <slot name="account">
    <HeaderAccountButton />
  </slot>
</template>
