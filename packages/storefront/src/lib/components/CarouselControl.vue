<script setup lang="ts">
import { inject } from 'vue';
import { type CarouselInject, carouselKey } from '@@sf/components/_injection-keys';

export interface Props {
  direction?: number;
}

withDefaults(defineProps<Props>(), {
  direction: 1,
});
const { changeSlide } = inject(carouselKey) as CarouselInject;
</script>

<template>
  <button
    type="button"
    :aria-label="direction > 0 ? $t.i19next : $t.i19previous"
    @click="changeSlide(direction)"
    class="group absolute top-0 z-1"
    :class="direction > 0 ? 'right-0' : 'left-0'"
    :data-carousel-control="direction > 0 ? 'next' : 'previous'"
  >
    <slot>
      <i
        class="m-0"
        :class="direction > 0
          ? 'i-chevron-right group-active:translate-x-1'
          : 'i-chevron-left group-active:-translate-x-1'"
      ></i>
    </slot>
  </button>
</template>
