<script lang="ts" setup>
import { toRefs, ImgHTMLAttributes } from 'vue';

export interface Props {
  img: ImgHTMLAttributes;
}

const props = defineProps<Props>();
const { img } = toRefs(props);
</script>

<template>
  <a href="/">
    <component :is="img.alt ? 'h1' : 'span'" class="m-0">
      <img v-bind="img" />
    </component>
  </a>
</template>
