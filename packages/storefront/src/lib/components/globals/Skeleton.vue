<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
  isBold?: boolean;
  isLarge?: boolean;
}

const props = defineProps<Props>();
const rowClassName = 'bg-gray-200 rounded-md dark:bg-gray-700';
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
    <div :class="[nextRowsClassName, isLarge ? 'max-w-[680px]' : 'max-w-[340px]']"></div>
    <div :class="nextRowsClassName"></div>
    <div :class="[nextRowsClassName, isLarge ? 'max-w-[660px]' : 'max-w-[330px]']"></div>
    <div :class="[nextRowsClassName, isLarge ? 'max-w-[600px]' : 'max-w-[300px]']"></div>
    <div :class="[nextRowsClassName, isLarge ? 'max-w-[720px]' : 'max-w-[360px]']"></div>
    <span class="sr-only">Loading...</span>
  </div>
</template>
