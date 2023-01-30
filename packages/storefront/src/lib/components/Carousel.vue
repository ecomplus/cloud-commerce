<script setup lang="ts">
/* REFERENCE: https://github.com/bartdominiak/vue-snap */
import {
  onMounted,
  onBeforeUnmount,
  ref,
  computed,
  watch,
  toRef,
  nextTick,
  provide,
} from 'vue';
import { useDebounceFn, useElementHover, useScroll } from '@vueuse/core';
import { carouselKey } from './_injection-keys';
import CarouselControl from './CarouselControl.vue';

export interface Props {
  as?: string;
  modelValue?: number;
  autoplay?: number; // milliseconds
}

const props = withDefaults(defineProps<Props>(), {
  as: 'ul',
  modelValue: 1,
});
const emit = defineEmits([
  'update:modelValue',
]);
const currentIndex = ref(props.modelValue - 1);
watch(toRef(props, 'modelValue'), (modelValue) => {
  currentIndex.value = modelValue - 1;
});
watch(currentIndex, (current, previous) => {
  if (current !== previous) {
    emit('update:modelValue', current + 1);
  }
});
const wrapper = ref<HTMLElement>(null);
const { x: currentPos, isScrolling, arrivedState } = useScroll(wrapper);
const isBoundLeft = computed(() => arrivedState.left);
const isBoundRight = computed(() => arrivedState.right);
const slidesWidth = ref([]);
const wrapperScrollWidth = ref(0);
const wrapperVisibleWidth = ref(0);
const indexCount = ref(0);
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
  const nextSlideIndex = direction > 0
    ? currentIndex.value : currentIndex.value + direction;
  const width = slidesWidth.value[nextSlideIndex]?.width || 0;
  if (!width) {
    return 0;
  }
  return width * direction;
};
const calcCurrentIndex = () => {
  const getCurrentIndex = slidesWidth.value.findIndex((slide: HTMLElement) => {
    // Find the closest point, with 5px approximate.
    return Math.abs(slide.offsetLeft - currentPos.value) <= 5;
  });
  if (getCurrentIndex > -1) {
    currentIndex.value = getCurrentIndex || 0;
  }
};
const calcIndexCount = () => {
  const maxPos = wrapperScrollWidth.value - wrapperVisibleWidth.value;
  indexCount.value = slidesWidth.value
    .findIndex(({ offsetLeft }) => (offsetLeft >= maxPos - 5));
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
const changeSlide = (direction: number) => {
  if (direction < 0) {
    if (isBoundLeft.value) {
      calcIndexCount();
      currentIndex.value = indexCount.value - 1;
      changeSlide(1);
      return;
    }
  } else if (isBoundRight.value) {
    currentIndex.value = 1;
    changeSlide(-1);
    return;
  }
  const nextSlideWidth = calcNextWidth(direction);
  if (nextSlideWidth) {
    wrapper.value.scrollBy({ left: nextSlideWidth, behavior: 'smooth' });
    restartAutoplay();
  }
};
watch(isScrolling, (_isScrolling: boolean) => {
  if (_isScrolling) {
    clearTimeout(autoplayTimer);
  } else {
    calcCurrentIndex();
    restartAutoplay();
  }
});
const carousel = ref(null);
const isHovered = useElementHover(carousel);
watch(isHovered, (_isHovered: boolean) => {
  if (_isHovered) {
    clearTimeout(autoplayTimer);
  } else {
    restartAutoplay();
  }
});
const calcOnInit = () => {
  if (!wrapper.value) {
    return;
  }
  calcWrapperWidth();
  calcSlidesWidth();
  calcCurrentIndex();
  calcIndexCount();
};
const onResize = useDebounceFn(calcOnInit, 400);
onMounted(() => {
  calcOnInit();
  if (!import.meta.env.SSR) {
    nextTick(() => {
      [...wrapper.value.children].forEach((slide: HTMLElement) => {
        slide.setAttribute('tabindex', '0');
      });
    });
    restartAutoplay();
    window.addEventListener('resize', onResize);
  }
});
onBeforeUnmount(() => {
  if (!import.meta.env.SSR) {
    window.removeEventListener('resize', onResize);
  }
  clearTimeout(autoplayTimer);
});
provide(carouselKey, {
  autoplay: toRef(props, 'autoplay'),
  changeSlide,
  isBoundLeft,
  isBoundRight,
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
      v-bind="{
        changeSlide,
        isBoundLeft,
        isBoundRight,
        currentPage: currentIndex + 1,
        pageCount: indexCount + 1,
      }"
    >
      <CarouselControl :direction="-1">
        <slot name="previous" />
      </CarouselControl>
      <CarouselControl>
        <slot name="next" />
      </CarouselControl>
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
  z-index: 1;
}
[data-carousel-control=previous] {
  left: 0;
}
[data-carousel-control=next] {
  right: 0;
}
</style>
