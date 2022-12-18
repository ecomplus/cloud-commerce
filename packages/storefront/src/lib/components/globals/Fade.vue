<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
  slide?: 'down' | 'left' | 'right' | 'up',
  isLeaveTo?: boolean,
  isEnterFrom?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  isLeaveTo: true,
  isEnterFrom: true,
});
const transform = computed(() => {
  switch (props.slide) {
    case 'down':
      return 'translate3d(0, -100%, 0)';
    case 'left':
      return 'translate3d(-100%, 0, 0)';
    case 'right':
      return 'translate3d(100%, 0, 0)';
    case 'up':
      return 'translate3d(0, 100%, 0)';
    default:
      return 'none';
  }
});
const opacity = computed(() => {
  return transform.value !== 'none' ? 0.1 : 0;
});
const enterFromOpacity = computed(() => {
  return props.isEnterFrom ? opacity.value : 1;
});
const leaveToOpacity = computed(() => {
  return props.isLeaveTo ? opacity.value : 1;
});
const enterFromTransform = computed(() => {
  return props.isEnterFrom ? transform.value : 'none';
});
const leaveToTransform = computed(() => {
  return props.isLeaveTo ? transform.value : 'none';
});
</script>

<template>
  <Transition name="sf-fade">
    <slot />
  </Transition>
</template>

<style>
.sf-fade-enter-active,
.sf-fade-leave-active {
  transition: opacity var(--transition), transform var(--transition);
}
.sf-fade-enter-from {
  opacity: var(--enter-from-opacity);
  transform: var(--enter-from-transform);
}
.sf-fade-leave-to {
  opacity: var(--leave-to-opacity);
  transform: var(--leave-to-transform);
}
</style>

<style scoped>
[class*=sf-fade] {
  --enter-from-opacity: v-bind(enterFromOpacity);
  --leave-to-opacity: v-bind(leaveToOpacity);
  --enter-from-transform: v-bind(enterFromTransform);
  --leave-to-transform: v-bind(leaveToTransform);
}
</style>
