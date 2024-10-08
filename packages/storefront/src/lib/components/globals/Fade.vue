<script setup lang="ts">
import { computed } from 'vue';

export type Props = {
  speed?: 'default' | 'fast' | 'slow' | 'slower',
  slide?: 'down' | 'left' | 'right' | 'up' | null,
  isFloating?: boolean,
  isLeaveTo?: boolean,
  isEnterFrom?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  speed: 'default',
  isFloating: false,
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
  if (props.isFloating) return null;
  return isSlideY.value ? 0 : 'auto';
});
const width = computed(() => {
  if (props.isFloating) return null;
  return props.slide && !isSlideY.value ? 0 : 'auto';
});
const enterFromHeight = computed(() => {
  return props.isEnterFrom ? height.value : 'auto';
});
const enterFromWidth = computed(() => {
  return props.isEnterFrom ? width.value : 'auto';
});
const willChange = computed(() => {
  let properties = 'opacity';
  if (transform.value !== 'none') properties += ', transform';
  if (height.value === 0) properties += ', height';
  if (width.value === 0) properties += ', width';
  return properties;
});
const setInitialStyles = (el: HTMLElement) => {
  el.style.setProperty('--fade-will-change', willChange.value);
  el.style.setProperty('--fade-duration', duration.value);
  el.style.setProperty('--fade-enter-opacity', String(enterFromOpacity.value));
  el.style.setProperty('--fade-enter-transform', String(enterFromTransform.value));
  el.style.setProperty('--fade-enter-height', String(enterFromHeight.value));
  el.style.setProperty('--fade-enter-width', String(enterFromWidth.value));
  el.style.setProperty('--fade-leave-opacity', String(leaveToOpacity.value));
  el.style.setProperty('--fade-leave-transform', String(leaveToTransform.value));
};
const onEnter = (el: HTMLElement) => {
  if (props.slide && !props.isFloating && props.isEnterFrom) {
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
    el.style.width = isSlideY.value ? '' : '0';
    el.style.height = isSlideY.value ? '0' : '';
    el.style.position = '';
    el.style.visibility = '';
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
  if (props.slide && !props.isFloating && props.isEnterFrom) {
    el.style[isSlideY.value ? 'height' : 'width'] = '';
  }
};
const onLeave = (el: HTMLElement) => {
  if (props.slide && !props.isFloating && props.isLeaveTo) {
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
    @before-enter="(setInitialStyles as any)"
    @enter="(onEnter as any)"
    @before-leave="(setInitialStyles as any)"
    @after-enter="(onAfterEnter as any)"
    @leave="(onLeave as any)"
  >
    <slot />
  </Transition>
</template>
