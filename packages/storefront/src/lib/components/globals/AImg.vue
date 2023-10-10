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
  picture: PictureSize | {
    normal?: PictureSize;
    big?: PictureSize;
    zoom?: PictureSize;
    small?: PictureSize;
    _id?: string;
    tag?: string;
  };
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  alt?: string;
  preferredSize?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
});
const image = computed<Partial<PictureSize>>(() => {
  if ((props.picture as PictureSize).url) {
    return props.picture as PictureSize;
  }
  return getImg(props.picture, undefined, props.preferredSize) || {};
});
const dimensions = computed(() => {
  return getImgSizes(image.value) as { width: number, height: number };
});
const attrs = computed<ImgHTMLAttributes>(() => ({
  src: image.value.url,
  alt: image.value.alt || props.alt,
  width: dimensions.value.width || undefined,
  height: dimensions.value.height || undefined,
  loading: props.loading,
  decoding: props.decoding || (dimensions.value.height ? 'async' : undefined),
}));
</script>

<template>
  <img v-bind="attrs" />
</template>
