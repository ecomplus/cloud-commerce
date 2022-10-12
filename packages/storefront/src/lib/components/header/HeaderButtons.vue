<script lang="ts" setup>
import HeaderAccountButton from '@@components/header/HeaderAccountButton.vue';
</script>

<template>
  <div class="text-2xl">
    <slot name="account">
      <HeaderAccountButton />
    </slot>
  </div>
</template>
