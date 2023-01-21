<script setup lang="ts">
import Carousel from '@@sf/components/Carousel.vue';
import CarouselControl from '@@sf/components/CarouselControl.vue';

export interface Props {
  slides: Array<{
    href?: string;
    target?: string;
    html: string;
  }>;
}

defineProps<Props>();
</script>

<template>
  <div data-pitch-bar class="bg-base-100">
    <div class="container md:w-2/3 mx-auto px-3 py-1">
      <Carousel :autoplay="7000">
        <li v-for="({ href, target, html }, i) in slides" :key="i">
          <component
            :is="href ? 'ALink' : 'span'"
            :href="href"
            :target="target"
            :class="href ? 'hover:underline' : null"
          >
            <slot name="slide">
              <span v-html="html" class="prose text-sm text-base-800"></span>
            </slot>
          </component>
        </li>
        <template #controls>
          <div class="text-xl leading-none text-base-400">
            <CarouselControl
              :direction="-1"
              class="pr-2 bg-base-100 hover:text-base-700"
            />
            <CarouselControl class="pl-2 bg-base-100 hover:text-base-700" />
          </div>
        </template>
      </Carousel>
    </div>
  </div>
</template>
