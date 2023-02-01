<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
  speed?: 'default' | 'slow' | 'slower',
  slide?: 'down' | 'left' | 'right' | 'up',
  isLeaveTo?: boolean,
  isEnterFrom?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  speed: 'default',
  isLeaveTo: true,
  isEnterFrom: true,
});
const duration = computed(() => {
  if (props.speed === 'default') return 'var(--transition, .2s linear)';
  return `var(--transition-${props.speed}, .4s linear)`;
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
const isSlideY = computed(() => {
  return props.slide === 'down' || props.slide === 'up';
});
const height = computed(() => {
  return isSlideY.value ? 0 : 'auto';
});
const width = computed(() => {
  return props.slide && !isSlideY.value ? 0 : 'auto';
});
const enterFromHeight = computed(() => {
  return props.isEnterFrom ? height.value : 'auto';
});
const leaveToHeight = computed(() => {
  return props.isLeaveTo ? height.value : 'auto';
});
const enterFromWidth = computed(() => {
  return props.isEnterFrom ? width.value : 'auto';
});
const leaveToWidth = computed(() => {
  return props.isLeaveTo ? width.value : 'auto';
});
const willChange = computed(() => {
  let properties = 'opacity';
  if (transform.value !== 'none') properties += ', transform';
  if (height.value !== 'auto') properties += ', height';
  if (width.value !== 'auto') properties += ', width';
  return properties;
});
const onEnter = (el: HTMLElement) => {
  if (props.slide) {
    if (isSlideY.value) {
      el.style.width = getComputedStyle(el).width;
      el.style.height = 'auto';
    } else {
      el.style.width = 'auto';
      el.style.height = getComputedStyle(el).height;
    }
    el.style.position = 'absolute';
    el.style.visibility = 'hidden';
    // eslint-disable-next-line no-shadow
    const { width, height } = getComputedStyle(el);
    el.style.width = isSlideY.value ? null : '0';
    el.style.height = isSlideY.value ? '0' : null;
    el.style.position = null;
    el.style.visibility = null;
    // Force repaint to make sure the animation is triggered correctly
    // eslint-disable-next-line no-unused-expressions
    getComputedStyle(el)[isSlideY.value ? 'height' : 'width'];
    requestAnimationFrame(() => {
      if (isSlideY.value) {
        el.style.height = height;
      } else {
        el.style.width = width;
      }
    });
  }
};
const onAfterEnter = (el: HTMLElement) => {
  if (props.slide) {
    el.style[isSlideY.value ? 'height' : 'width'] = null;
  }
};
const onLeave = (el: HTMLElement) => {
  if (props.slide) {
    if (isSlideY.value) {
      el.style.height = getComputedStyle(el).height;
    } else {
      el.style.width = getComputedStyle(el).width;
    }
    const sizeProp = isSlideY.value ? 'height' : 'width';
    // eslint-disable-next-line no-unused-expressions
    getComputedStyle(el)[sizeProp];
    requestAnimationFrame(() => {
      el.style[sizeProp] = '0';
    });
  }
};
</script>

<template>
  <Transition
    name="sf-fade"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @leave="onLeave"
  >
    <slot />
  </Transition>
</template>

<style>
.sf-fade-enter-active,
.sf-fade-leave-active {
  transition: opacity var(--duration), transform var(--duration),
    height var(--duration), width var(--duration);
  overflow: hidden;
}
</style>

<style scoped>
* {
  will-change: v-bind(willChange);
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
.sf-fade-enter-active,
.sf-fade-leave-active {
  --duration: v-bind(duration);
}
.sf-fade-enter-from {
  opacity: v-bind(enterFromOpacity);
  transform: v-bind(enterFromTransform);
  height: v-bind(enterFromHeight);
  width: v-bind(enterFromWidth);
}
.sf-fade-leave-to {
  opacity: v-bind(leaveToOpacity);
  transform: v-bind(leaveToTransform);
  height: v-bind(leaveToHeight);
  width: v-bind(leaveToWidth);
}
</style>
