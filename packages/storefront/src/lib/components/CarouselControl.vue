<script setup lang="ts">
import { inject } from 'vue';
import { type CarouselInject, carouselKey } from '@@sf/components/Carousel.vue';

export type Props = {
  isPrev?: boolean;
}

withDefaults(defineProps<Props>(), {
  isPrev: false,
});
const { axis, changeSlide } = inject(carouselKey) as CarouselInject;
const isX = axis === 'x';
</script>

<template>
  <button
    type="button"
    :aria-label="!isPrev ? $t.i19next : $t.i19previous"
    @click.stop.prevent="changeSlide(!isPrev ? 1 : -1)"
    class="group absolute z-[11]"
    :class="isX
      ? `${(!isPrev ? 'right-0' : 'left-0')} top-0`
      : `${(!isPrev ? 'bottom-0' : 'top-0')} left-0`"
    :data-carousel-control="!isPrev ? 'next' : 'previous'"
  >
    <slot>
      <i
        class="m-0 i-chevron-right"
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
