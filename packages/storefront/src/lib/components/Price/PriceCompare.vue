<script setup lang="ts">
import type { Exposed } from '../Price.vue';

const instance = getCurrentInstance();
const price = (instance.parent.exposed as Exposed).salePrice;
</script>

<template>
  <div class="price-sale">
    {{ price }}
  </div>
</template>
