<script setup lang="ts">
import { ref } from 'vue';
import Prices from '@@components/Prices.vue';

export interface Props {
  as?: string;
}

withDefaults(defineProps<Props>(), {
  as: 'div',
});
const price = ref(12);
const isBig = ref(false);
setTimeout(() => {
  price.value = 8;
  isBig.value = true;
}, 5000);
</script>

<template>
  <component :is="as">
    <Prices v-slot="{ salePrice }">
      ProductCard {{ salePrice }}
    </Prices>
    <Prices :product="{ price }" />
    <Prices :price="12" :base-price="17" />
    <Prices :price="12" :base-price="16" :is-literal="true" />
    <Prices :price="12" :is-big="isBig" />
    <Prices :price="14" :base-price="18" :is-big="isBig" :is-literal="true" />
    <Prices :price="12" :base-price="16">
      <template #compare-value="{ comparePrice }">
        x{{ comparePrice }}
      </template>
    </Prices>
  </component>
</template>
