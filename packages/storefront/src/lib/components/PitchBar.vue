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
  <div data-pitch-bar>
    <div class="container md:w-2/3 mx-auto px-3 py-1">
      <Carousel :autoplay="countValidSlides > 1 ? 7000 : null">
        <li v-for="(slide, i) in slides" :key="i">
          <component
            :is="slide.href ? 'ALink' : 'span'"
            :href="slide.href"
            :target="slide.target"
            class="inline-block px-8"
            :class="slide.href ? 'hover:underline' : null"
          >
            <slot name="slide" v-bind="{ slide, i, parsedContents }">
              <span
                v-if="parsedContents[i]"
                v-html="parsedContents[i]"
                class="prose text-sm"
                data-pitch-bar-slide
              ></span>
            </slot>
          </component>
        </li>
        <template #controls>
          <slot name="controls" v-bind="{ countValidSlides }">
            <div
              v-show="countValidSlides > 1"
              class="text-xl leading-none"
              data-pitch-bar-controls
            >
              <CarouselControl
                :direction="-1"
                class="pr-2 opacity-40 hover:opacity-80"
              />
              <CarouselControl class="pl-2 opacity-40 hover:opacity-80" />
            </div>
          </slot>
        </template>
      </Carousel>
    </div>
  </div>
</template>
