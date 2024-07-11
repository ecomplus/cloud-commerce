<script setup lang="ts">
import { computed } from 'vue';

export type Props = {
  isBold?: boolean;
  isLarge?: boolean;
  numRows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  numRows: 6,
});
const rowClassName = 'bg-base-200 rounded-md';
const firstRowClassName = computed(() => {
  return `${rowClassName} ${(props.isBold ? 'h-8 mb-6' : 'h-2.5 mb-4')}`;
});
const nextRowsClassName = computed(() => {
  return `${rowClassName} ${(props.isBold ? 'h-5 mb-4' : 'h-2 mb-2.5')}`;
});
</script>

<template>
  <div role="status" class="animate-pulse" :class="isLarge ? 'max-w-4xl' : 'max-w-sm'">
    <div :class="[firstRowClassName, isLarge ? 'w-96' : 'w-48']"></div>
    <div
      v-if="numRows > 1"
      :class="[nextRowsClassName, isLarge ? 'max-w-[680px]' : 'max-w-[340px]']"
    ></div>
    <div
      v-if="numRows > 2"
      :class="nextRowsClassName"
    ></div>
    <div
      v-if="numRows > 3"
      :class="[nextRowsClassName, isLarge ? 'max-w-[660px]' : 'max-w-[330px]']"
    ></div>
    <div
      v-if="numRows > 4"
      :class="[nextRowsClassName, isLarge ? 'max-w-[600px]' : 'max-w-[300px]']"
    ></div>
    <template v-if="numRows > 5">
      <div
        v-for="n in (numRows - 5)" :key="n"
        :class="[nextRowsClassName, isLarge ? 'max-w-[720px]' : 'max-w-[360px]']"
      ></div>
    </template>
    <span class="sr-only">Loading...</span>
  </div>
</template>
