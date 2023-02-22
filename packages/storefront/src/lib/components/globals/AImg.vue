<script setup lang="ts">
import { type ImgHTMLAttributes, computed } from 'vue';
import {
  img as getImg,
  imgSizes as getImgSizes,
} from '@ecomplus/utils';

export interface PictureSize {
  url: string;
  alt?: string;
  size?: string;
}

export interface Props {
  picture: {
    url: string;
    alt?: string;
    size?: string;
    normal?: PictureSize;
    big?: PictureSize;
    zoom?: PictureSize;
    small?: PictureSize;
    _id?: string;
    tag?: string;
  };
  loading?: 'lazy' | 'eager';
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
});
const image = computed(() => {
  if ((props.picture as PictureSize).url) {
    return props.picture;
  }
  return getImg(props.picture) as PictureSize;
});
const dimensions = computed(() => {
  return getImgSizes(image.value) as { width: number, height: number };
});
const attrs = computed<ImgHTMLAttributes>(() => ({
  ...props,
  width: dimensions.value.width || null,
  height: dimensions.value.height || null,
  src: image.value.url,
  alt: image.value.alt,
  picture: null,
}));
</script>

<template>
  <img v-bind="attrs" />
</template>
