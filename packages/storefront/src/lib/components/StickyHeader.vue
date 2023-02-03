<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  reactive,
  onMounted,
} from 'vue';
import {
  promiseTimeout,
  useTimeout,
  useDebounceFn,
  useScroll,
} from '@vueuse/core';
import useComponentVariant from '@@sf/composables/use-component-variant';

export interface Props {
  isShownOnScrollDown?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits([
  'set:is-sticky',
  'set:height',
  'set:static-y',
]);
const header = ref<HTMLElement | null>(null);
const { ready, start } = useTimeout(100, { controls: true, immediate: false });
const height = ref(0);
const staticY = ref(0);
if (!import.meta.env.SSR) {
  onMounted(() => {
    const fixHeight = () => {
      height.value = header.value.offsetHeight;
      staticY.value = height.value
        + window.pageYOffset + header.value.getBoundingClientRect().top;
      emit('set:height', height.value);
      emit('set:static-y', staticY.value);
      start();
    };
    const imgs = header.value.getElementsByTagName('IMG');
    let isAllLoaded = true;
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i] as HTMLImageElement;
      if (!img.complete || img.naturalHeight === 0) {
        isAllLoaded = false;
        img.onload = fixHeight;
      }
    }
    if (isAllLoaded) {
      fixHeight();
    }
    window.addEventListener('resize', useDebounceFn(fixHeight, 300));
  });
}
const { y } = !import.meta.env.SSR ? useScroll(document) : { y: ref(0) };
const isSticky = computed(() => ready.value && y.value > staticY.value * 1.2);
const transition = ref('none');
watch(isSticky, async (_isSticky) => {
  if (!_isSticky) {
    start();
    transition.value = 'none';
  } else {
    await promiseTimeout(300);
    transition.value = 'opacity var(--transition-slow), transform var(--transition)';
  }
  emit('set:is-sticky', _isSticky);
});
const isScrollUp = ref(false);
watch(y, (newY, oldY) => {
  isScrollUp.value = newY > 0 && newY < oldY;
});
const componentVariant = useComponentVariant(reactive({
  ...props,
  isSticky,
  isScrollUp,
}));
</script>

<template>
  <header
    ref="header"
    class="z-50 top-0 will-change-transform"
    :class="{
      'sticky py-2 md:py-3': isSticky,
      'opacity-0 -translate-y-full': isSticky && (!isScrollUp || isShownOnScrollDown),
      'py-3 sm:py-4 md:py-5': !isSticky,
    }"
    :style="{ transition }"
    :data-sticky-header="componentVariant"
  >
    <slot/>
    <Teleport to="#teleported-top">
      <div :style="isSticky ? `height: ${height}px` : null"></div>
    </Teleport>
  </header>
</template>
