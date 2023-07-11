<script setup lang="ts">
import { inject } from 'vue';
import { type CarouselInject, carouselKey } from '@@sf/components/_injection-keys';

export interface Props {
  isPrev?: boolean;
}

withDefaults(defineProps<Props>(), {
  isPrev: false,
});
const { changeSlide } = inject(carouselKey) as CarouselInject;
</script>

<template>
  <button
    type="button"
    :aria-label="!isPrev ? $t.i19next : $t.i19previous"
    @click="changeSlide(!isPrev ? 1 : -1)"
    class="group absolute top-0 z-1"
    :class="!isPrev ? 'right-0' : 'left-0'"
    :data-carousel-control="!isPrev ? 'next' : 'previous'"
  >
    <slot>
      <i
        class="m-0"
        :class="!isPrev
          ? 'i-chevron-right group-active:translate-x-1'
          : 'i-chevron-left group-active:-translate-x-1'"
      ></i>
    </slot>
  </button>
</template>
