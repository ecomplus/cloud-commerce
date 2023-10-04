<script setup lang="ts">
import { inject } from 'vue';
import { type CarouselInject, carouselKey } from '@@sf/components/Carousel.vue';

export interface Props {
  isPrev?: boolean;
  axis?: 'x' | 'y';
}

const props = withDefaults(defineProps<Props>(), {
  isPrev: false,
  axis: 'x',
});
const isX = props.axis === 'x';
const { changeSlide } = inject(carouselKey) as CarouselInject;
</script>

<template>
  <button
    type="button"
    :aria-label="!isPrev ? $t.i19next : $t.i19previous"
    @click="changeSlide(!isPrev ? 1 : -1)"
    class="z-1 group absolute"
    :class="isX
      ? `${(!isPrev ? 'right-0' : 'left-0')} top-0`
      : `${(!isPrev ? 'bottom-0' : 'top-0')} left-0`"
    :data-carousel-control="!isPrev ? 'next' : 'previous'"
  >
    <slot>
      <i
        class="i-chevron-right m-0"
        :class="{
          'group-active:translate-x-1': isX && !isPrev,
          'rotate-180 group-active:-translate-x-1': isX && isPrev,
          'rotate-90 group-active:translate-y-1': !isX && !isPrev,
          '-rotate-90 group-active:-translate-y-1': !isX && isPrev,
        }"
      ></i>
    </slot>
  </button>
</template>
