<script setup lang="ts">
import { inject } from 'vue';
import { carouselKey } from './_injection-keys';

export interface Props {
  direction?: number;
}

withDefaults(defineProps<Props>(), {
  direction: 1,
});
const { changeSlide } = inject(carouselKey);
</script>

<template>
  <button
    type="button"
    :aria-label="direction > 0 ? $t.i19next : $t.i19previous"
    @click="changeSlide(direction)"
    :data-carousel-control="direction > 0 ? 'next' : 'previous'"
  >
    <slot>
      <i
        class="mb-0 z-10"
        :class="direction > 0 ? 'i-chevron-right' : 'i-chevron-left'"
      ></i>
    </slot>
  </button>
</template>
