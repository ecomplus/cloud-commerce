<script setup lang="ts">
import Prices from '@@components/Prices.vue';

export interface Props {
  as?: string;
}

withDefaults(defineProps<Props>(), {
  as: 'div',
});
</script>

<template>
  <component :is="as">
    <Prices v-slot="{ salePrice }">
      ProductCard {{ salePrice }}
    </Prices>
    <Prices :price="12" />
  </component>
</template>
