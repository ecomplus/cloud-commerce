<script setup lang="ts">
import { inject } from 'vue';
import {
  type QuantitySelectorInject,
  quantitySelectorKey,
} from '@@sf/components/QuantitySelector.vue';

export interface Props {
  isMinus?: boolean;
}

defineProps<Props>();
const {
  value,
  isBoundMin,
  isBoundMax,
} = inject(quantitySelectorKey) as QuantitySelectorInject;
</script>

<template>
  <button
    type="button"
    class="w-10 h-12 text-xl leading-12 enabled:text-primary
    enabled:hover:bg-primary-100/70 disabled:opacity-40"
    :data-quantity-selector-control="isMinus ? 'minus' : 'plus'"
    :aria-label="isMinus ? $t.i19minus : $t.i19plus"
    :disabled="isMinus ? isBoundMin : isBoundMax"
    @click.prevent="value += (isMinus ? -1 : 1)"
  >
    <slot>
      <template v-if="isMinus">&minus;</template>
      <template v-else>&plus;</template>
    </slot>
  </button>
</template>
