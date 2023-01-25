<script setup lang="ts">
import type { ImgHTMLAttributes } from 'vue';
import { toRefs } from 'vue';

export interface Props {
  logo?: ImgHTMLAttributes;
  logoAltHeading?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | null;
}

const props = withDefaults(defineProps<Props>(), {
  logoAltHeading: 'h2',
});
const { logo } = toRefs(props);
</script>

<template>
  <header class="header bg-opacity-90 backdrop-blur-md
    sticky top-0 z-50 py-1 sm:py-2" data-sticky-header>
    <div class="container">
      <div class="grid grid-flow-col auto-cols-max justify-between items-center">
        <slot name="aside">
          <div class="header__aside md:hidden">
            <div class="i-bars-3-bottom-left"></div>
          </div>
        </slot>
        <slot name="logo" v-bind="{ logo }">
          <a v-if="logo" href="/">
            <component :is="(logo.alt && logoAltHeading) || 'span'" class="m-0">
              <img v-bind="logo" />
            </component>
          </a>
        </slot>
        <div class="flex items-center">
          <slot name="actions">
            <slot name="nav" />
            <slot name="search" />
            <slot name="buttons" />
          </slot>
        </div>
      </div>
    </div>
  </header>
</template>
