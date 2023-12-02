<script lang="ts">
import {
  type Ref,
  type InjectionKey,
  onMounted,
  onBeforeUnmount,
  ref,
  computed,
  watch,
  toRef,
  nextTick,
  provide,
} from 'vue';
import {
  useDebounceFn,
  useElementHover,
  useScroll,
} from '@vueuse/core';
import CarouselControl from '@@sf/components/CarouselControl.vue';

export type CarouselInject = {
  autoplay: Ref<number | undefined>,
  axis: 'x' | 'y',
  changeSlide: (step: number, isPageScroll?: boolean) => void,
  isBoundStart: Ref<boolean>,
  isBoundEnd: Ref<boolean>,
};

export const carouselKey = Symbol('carousel') as InjectionKey<CarouselInject>;
</script>

<script setup lang="ts">
/* REFERENCE: https://github.com/bartdominiak/vue-snap */
export interface Props {
  as?: string;
  index?: number;
  autoplay?: number; // milliseconds
  axis?: 'x' | 'y';
  hasControls?: boolean;
  wrapperKey?: string | number | null;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'ul',
  index: 0,
  axis: 'x',
});
const emit = defineEmits<{
  'update:index': [value: number]
}>();
const activeIndex = ref(0);
watch(toRef(props, 'index'), (index) => {
  if (index !== activeIndex.value) {
    const step = index - activeIndex.value;
    changeSlide(step, false);
  }
}, {
  immediate: true,
});
watch(activeIndex, (current, previous) => {
  if (current !== previous) {
    emit('update:index', current);
  }
});
const wrapper = ref<HTMLElement | null>(null);
const { [props.axis]: currentPos, isScrolling, arrivedState } = useScroll(wrapper);
const isX = props.axis === 'x';
const isBoundStart = computed(() => (isX ? arrivedState.left : arrivedState.top));
const isBoundEnd = computed(() => (isX ? arrivedState.right : arrivedState.bottom));
const slideSizes = ref<{ offset: number; size: number; }[]>([]);
const wrapperScrollSize = ref(0);
const wrapperVisibleSize = ref(0);
const calcWrapperSize = () => {
  if (!wrapper.value) return;
  if (isX) {
    wrapperScrollSize.value = wrapper.value.scrollWidth;
    wrapperVisibleSize.value = wrapper.value.offsetWidth;
  } else {
    wrapperScrollSize.value = wrapper.value.scrollHeight;
    wrapperVisibleSize.value = wrapper.value.offsetHeight;
  }
};
const calcSlidesSize = () => {
  if (!wrapper.value) return;
  let childNodes = [...wrapper.value.children] as HTMLElement[];
  if (childNodes.length === 1 && childNodes[0].tagName.endsWith('SLOT')) {
    childNodes = [...childNodes[0].children] as HTMLElement[];
  }
  slideSizes.value = childNodes.map((node) => ({
    offset: isX ? node.offsetLeft : node.offsetTop,
    size: isX ? node.offsetWidth : node.offsetHeight,
  }));
};
const calcNextOffset = (step: number) => {
  let nextSlideIndex = activeIndex.value + step;
  if (nextSlideIndex >= slideSizes.value.length) {
    return 0;
  }
  if (nextSlideIndex < 0) {
    nextSlideIndex = slideSizes.value.length + nextSlideIndex;
  }
  const { offset, size } = slideSizes.value[nextSlideIndex] || {};
  if (!size) {
    return 0;
  }
  return offset;
};
const calcCurrentIndex = () => {
  const index = slideSizes.value.findIndex((slide) => {
    // Find the closest point, with 5px approximate.
    return Math.abs(slide.offset - currentPos.value) <= 5;
  });
  if (index > -1) {
    activeIndex.value = index || 0;
  }
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
const changeSlide = (step: number, isPageScroll: boolean = true) => {
  if (slideSizes.value.length < 2) {
    return;
  }
  let nextOffset = -1;
  if (currentPos.value + wrapperVisibleSize.value >= wrapperScrollSize.value) {
    nextOffset = 0;
  } else {
    if (isPageScroll && (step === 1 || step === -1)) {
      let pageStep = 0;
      let pageStepSize = 0;
      for (let i = activeIndex.value; i < slideSizes.value.length; i++) {
        const { size } = slideSizes.value[i] || {};
        if (size) {
          pageStep += 1;
          pageStepSize += size;
          if (pageStepSize + size * 0.75 >= wrapperVisibleSize.value) {
            break;
          }
        }
      }
      if (pageStep) {
        step = step > 0 ? pageStep : -pageStep;
      }
    }
    nextOffset = calcNextOffset(step);
  }
  wrapper.value?.scrollTo({
    [isX ? 'left' : 'top']: nextOffset,
    behavior: 'smooth',
  });
  restartAutoplay();
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
  calcWrapperSize();
  calcSlidesSize();
  calcCurrentIndex();
};
const onResize = useDebounceFn(() => {
  if (!wrapper.value) return;
  if (isX) {
    wrapper.value.scrollLeft = 0;
  } else {
    wrapper.value.scrollTop = 0;
  }
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
watch(toRef(props, 'wrapperKey'), calcOnInit);
onBeforeUnmount(() => {
  if (!import.meta.env.SSR) {
    window.removeEventListener('resize', onResize);
  }
  clearTimeout(autoplayTimer);
});
provide(carouselKey, {
  autoplay: toRef(props, 'autoplay'),
  axis: props.axis,
  changeSlide,
  isBoundStart,
  isBoundEnd,
});
</script>

<template>
  <div
    ref="carousel"
    :class="`relative ${(!isX ? 'overflow-hidden' : '')}`"
    data-carousel
  >
    <component
      :is="as"
      ref="wrapper"
      class="m-0 flex snap-mandatory list-none scroll-smooth p-0
      [&>*]:snap-start [&>*]:outline-none"
      :class="isX
        ? 'snap-x overflow-y-hidden overflow-x-scroll'
        : 'h-full flex-col snap-y overflow-x-hidden overflow-y-scroll'"
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
        isBoundStart,
        isBoundEnd,
        activeIndex,
      }"
    >
      <CarouselControl v-if="slideSizes.length > 1 || hasControls" is-prev>
        <slot name="previous" />
      </CarouselControl>
      <CarouselControl v-if="slideSizes.length > 1 || hasControls">
        <slot name="next" />
      </CarouselControl>
    </slot>
  </div>
</template>
