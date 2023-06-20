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
import { carouselKey } from '@@sf/components/_injection-keys';
import CarouselControl from '@@sf/components/CarouselControl.vue';

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
const wrapper = ref<HTMLElement | null>(null);
const { x: currentPos, isScrolling, arrivedState } = useScroll(wrapper);
const isBoundLeft = computed(() => arrivedState.left);
const isBoundRight = computed(() => arrivedState.right);
const slidesWidth = ref<{ offsetLeft: number; width: number; }[]>([]);
const wrapperScrollWidth = ref(0);
const wrapperVisibleWidth = ref(0);
const indexCount = ref(0);
const calcWrapperWidth = () => {
  if (!wrapper.value) return;
  wrapperScrollWidth.value = wrapper.value.scrollWidth;
  wrapperVisibleWidth.value = wrapper.value.offsetWidth;
};
const calcSlidesWidth = () => {
  if (!wrapper.value) return;
  let childNodes = [...wrapper.value.children] as HTMLElement[];
  if (childNodes.length === 1 && childNodes[0].tagName.endsWith('SLOT')) {
    childNodes = [...childNodes[0].children] as HTMLElement[];
  }
  slidesWidth.value = childNodes.map((node) => ({
    offsetLeft: node.offsetLeft,
    width: node.offsetWidth,
  }));
};
const calcNextWidth = (direction: number) => {
  let nextSlideIndex = currentIndex.value + direction;
  if (nextSlideIndex >= slidesWidth.value.length) {
    nextSlideIndex = 0;
    direction = -direction;
  } else if (nextSlideIndex < 0) {
    nextSlideIndex = slidesWidth.value.length - 1;
    direction = -direction;
  }
  const width = slidesWidth.value[nextSlideIndex]?.width || 0;
  if (!width) {
    return 0;
  }
  return width * direction;
};
const calcCurrentIndex = () => {
  const getCurrentIndex = slidesWidth.value.findIndex((slide) => {
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
let autoplayTimer: ReturnType<typeof setTimeout> | undefined;
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
  const nextSlideWidth = calcNextWidth(direction);
  if (nextSlideWidth) {
    wrapper.value?.scrollBy({ left: nextSlideWidth, behavior: 'smooth' });
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
const onResize = useDebounceFn(() => {
  if (!wrapper.value) return;
  wrapper.value.scrollLeft = 0;
  calcOnInit();
}, 400);
onMounted(() => {
  calcOnInit();
  if (!import.meta.env.SSR) {
    nextTick(() => {
      if (!wrapper.value) return;
      [...wrapper.value.children].forEach((slide) => {
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
  <div ref="carousel" class="relative" data-carousel>
    <component
      :is="as"
      ref="wrapper"
      class="flex overflow-x-scroll overflow-y-hidden list-none m-0 p-0
        snap-x snap-mandatory scroll-smooth
        [&>*]:snap-start [&>*]:outline-none"
      style="
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        -ms-overflow-style: none;"
      data-carousel-wrapper
    >
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
