<script setup lang="ts">
/* REFERENCE: https://github.com/bartdominiak/vue-snap */
import {
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  toRef,
  nextTick,
} from 'vue';
import debounce from 'lodash/debounce';
import { useElementHover } from '@vueuse/core';

export interface Props {
  as?: string;
  modelValue?: number;
  autoplay?: number;
}

const approximatelyEqual = (v1, v2, epsilon) => {
  return Math.abs(v1 - v2) <= epsilon;
};
const SCROLL_DEBOUNCE = 100;
const RESIZE_DEBOUNCE = 410;

const props = withDefaults(defineProps<Props>(), {
  as: 'ul',
  modelValue: 1,
});
const emit = defineEmits([
  'update:modelValue',
  'bound-left',
  'bound-right',
]);

const currentPage = ref(props.modelValue - 1);
watch(toRef(props, 'modelValue'), (modelValue) => {
  currentPage.value = modelValue - 1;
});
watch(currentPage, (current, previous) => {
  if (current !== previous) {
    emit('update:modelValue', current + 1);
  }
});
const wrapper = ref<HTMLElement>(null);
const boundLeft = ref(true);
const boundRight = ref(false);
const slidesWidth = ref([]);
const wrapperScrollWidth = ref(0);
const wrapperVisibleWidth = ref(0);
const currentPos = ref(0);
const maxPages = ref(0);
const onResizeFn = ref(null);
const onScrollFn = ref(null);
const calcBounds = () => {
  // Find the closest point, with 5px approximate.
  const isBoundLeft = approximatelyEqual(currentPos.value, 0, 5);
  const isBoundRight = approximatelyEqual(
    wrapperScrollWidth.value - wrapperVisibleWidth.value,
    currentPos.value,
    5,
  );
  if (isBoundLeft) {
    emit('bound-left', true);
    boundLeft.value = true;
  } else {
    boundLeft.value = false;
  }
  if (isBoundRight) {
    emit('bound-right', true);
    boundRight.value = true;
  } else {
    boundRight.value = false;
  }
};
const calcWrapperWidth = () => {
  wrapperScrollWidth.value = wrapper.value.scrollWidth;
  wrapperVisibleWidth.value = wrapper.value.offsetWidth;
};
const calcSlidesWidth = () => {
  const childNodes = [...wrapper.value.children];
  slidesWidth.value = childNodes.map((node: HTMLElement) => ({
    offsetLeft: node.offsetLeft,
    width: node.offsetWidth,
  }));
};
const calcNextWidth = (direction) => {
  const nextSlideIndex = direction > 0 ? currentPage.value : currentPage.value + direction;
  const width = slidesWidth.value[nextSlideIndex].width || 0;
  if (!width) {
    return 0;
  }
  return width * direction;
};
const calcCurrentPage = () => {
  const getCurrentPage = slidesWidth.value.findIndex((slide) => {
    // Find the closest point, with 5px approximate.
    return approximatelyEqual(slide.offsetLeft, currentPos.value, 5);
  });
  if (getCurrentPage !== -1 && getCurrentPage !== -2) {
    currentPage.value = getCurrentPage || 0;
  }
};
const calcCurrentPosition = () => {
  currentPos.value = wrapper.value.scrollLeft || 0;
};
const calcMaxPages = () => {
  const maxPos = wrapperScrollWidth.value - wrapperVisibleWidth.value;
  maxPages.value = slidesWidth.value
    .findIndex(({ offsetLeft }) => (offsetLeft >= maxPos));
};
const calcOnInit = () => {
  if (!wrapper.value) {
    return;
  }
  calcWrapperWidth();
  calcSlidesWidth();
  calcCurrentPosition();
  calcCurrentPage();
  calcBounds();
  calcMaxPages();
};
const calcOnScroll = () => {
  if (!wrapper.value) {
    return;
  }
  calcCurrentPosition();
  calcCurrentPage();
  calcBounds();
};
let autoplayTimer = null;
const restartAutoplay = () => {
  if (props.autoplay) {
    clearTimeout(autoplayTimer);
    autoplayTimer = setTimeout(() => {
      // eslint-disable-next-line no-use-before-define
      changeSlide(1);
    }, props.autoplay);
  }
};
const changeSlide = (direction) => {
  if (direction < 0) {
    if (boundLeft.value) {
      calcMaxPages();
      currentPage.value = maxPages.value - 1;
      changeSlide(1);
      return;
    }
  } else if (boundRight.value) {
    currentPage.value = 1;
    changeSlide(-1);
    return;
  }
  const nextSlideWidth = calcNextWidth(direction);
  if (nextSlideWidth) {
    wrapper.value.scrollBy({ left: nextSlideWidth, behavior: 'smooth' });
    restartAutoplay();
  }
};
const carousel = ref(null);
const isHovered = useElementHover(carousel);
watch(isHovered, (_isHovered) => {
  if (_isHovered) {
    clearTimeout(autoplayTimer);
  } else {
    restartAutoplay();
  }
});
onMounted(() => {
  calcOnInit();
  if (!import.meta.env.SSR) {
    // Assign to new variable and keep reference for removeEventListener (Avoid Memory Leaks)
    onScrollFn.value = debounce(calcOnScroll, SCROLL_DEBOUNCE);
    onResizeFn.value = debounce(calcOnInit, RESIZE_DEBOUNCE);
    wrapper.value.addEventListener('scroll', onScrollFn.value);
    window.addEventListener('resize', onResizeFn.value);
    nextTick(() => {
      [...wrapper.value.children].forEach((slide: HTMLElement) => {
        slide.setAttribute('tabindex', '0');
      });
    });
    restartAutoplay();
  }
});
onBeforeUnmount(() => {
  if (!import.meta.env.SSR) {
    wrapper.value.removeEventListener('scroll', onScrollFn.value);
    window.removeEventListener('resize', onResizeFn.value);
    clearTimeout(autoplayTimer);
  }
});
</script>

<template>
  <div ref="carousel" data-carousel>
    <component :is="as" ref="wrapper" data-carousel-wrapper>
      <slot />
    </component>
    <!-- @slot Slot for Arrows -->
    <slot
      name="controls"
      :change-slide="changeSlide"
      :bound-left="boundLeft"
      :bound-right="boundRight"
    >
      <button
        type="button"
        :aria-label="$t.i19previous"
        @click="changeSlide(-1)"
        data-carousel-control="previous"
      >
        <slot name="previous">
          <i class="i-chevron-left px-3"></i>
        </slot>
      </button>
      <button
        type="button"
        :aria-label="$t.i19next"
        @click="changeSlide(1)"
        data-carousel-control="next"
      >
        <slot name="next">
          <i class="i-chevron-right px-3"></i>
        </slot>
      </button>
    </slot>
  </div>
</template>

<style>
[data-carousel] {
  position: relative;
}
[data-carousel-wrapper] {
  display: flex;
  overflow-x: scroll;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;
  list-style: none;
  margin: 0;
  padding: 0;
}
[data-carousel-wrapper]::-webkit-scrollbar {
  display: none;
}
[data-carousel-wrapper] > * {
  flex: 0 0 100%;
  height: 100%;
  scroll-snap-align: start;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
}
[data-carousel-control] {
  position: absolute;
  top: 0;
  bottom: 0;
}
[data-carousel-control=previous] {
  left: 0;
}
[data-carousel-control=next] {
  right: 0;
}
</style>
