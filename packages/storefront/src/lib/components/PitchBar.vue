<script setup lang="ts">
import { computed } from 'vue';
import { parseShippingPhrase } from '@@sf/state/modules-info';
import Carousel from '@@sf/components/Carousel.vue';
import CarouselControl from '@@sf/components/CarouselControl.vue';

export interface Props {
  slides: Array<{
    href?: string;
    target?: string;
    html: string;
  }>;
}

const props = defineProps<Props>();
const parsedContents = computed(() => {
  return props.slides.map(({ html }) => {
    return parseShippingPhrase(html).value;
  });
});
const countValidSlides = computed(() => {
  return parsedContents.value.filter((html) => html).length;
});
</script>

<template>
  <div data-pitch-bar class="bg-base-100">
    <div class="container md:w-2/3 mx-auto px-3 py-1">
      <Carousel :autoplay="countValidSlides > 1 ? 7000 : null">
        <li v-for="(slide, i) in slides" :key="i">
          <component
            :is="slide.href ? 'ALink' : 'span'"
            :href="slide.href"
            :target="slide.target"
            :class="slide.href ? 'hover:underline' : null"
          >
            <slot name="slide" v-bind="{ slide, i, parsedContents }">
              <span
                v-if="parsedContents[i]"
                v-html="parsedContents[i]"
                class="prose text-sm text-base-800"
              ></span>
            </slot>
          </component>
        </li>
        <template #controls>
          <div
            v-show="countValidSlides > 1"
            class="text-xl leading-none text-base-400"
          >
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
