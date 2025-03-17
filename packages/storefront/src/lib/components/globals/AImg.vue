<script setup lang="ts">
import { type ImgHTMLAttributes, computed } from 'vue';
import {
  img as getImg,
  imgSizes as getImgSizes,
} from '@ecomplus/utils';

export type PictureSize = {
  url: string;
  alt?: string;
  size?: string;
}

export type Props = {
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
  sizes?: string | Array<{
    maxScreen?: number;
    width: number;
  }>;
  preferredSize?: string;
  responsiveSizes?: Record<string, number | true>;
  isImgTagOnly?: boolean;
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
if (props.sizes?.length) {
  if (Array.isArray(props.sizes)) {
    let attrSizes = '';
    props.sizes.forEach(({ maxScreen, width }) => {
      if (attrSizes) attrSizes += ', ';
      if (maxScreen) attrSizes += `(max-width: ${maxScreen}px) `;
      attrSizes += `${width}px`;
    });
    if (attrSizes.length) attrs.value.sizes = attrSizes;
  } else {
    attrs.value.sizes = props.sizes;
  }
}
const { responsiveSizes } = props;
if (responsiveSizes) {
  const sizeKeys = responsiveSizes && Object.keys(responsiveSizes);
  if (sizeKeys?.length) {
    let attrSrcset = '';
    sizeKeys.forEach((size) => {
      if (!responsiveSizes[size]) return;
      const img = getImg(props.picture, undefined, size);
      if (!img) return;
      const width = typeof responsiveSizes[size] === 'number'
        ? responsiveSizes[size]
        : getImgSizes(img).width as number;
      if (!width) return;
      if (attrSrcset) {
        attrSrcset += ', ';
      }
      attrSrcset += `${img.url} ${width}w`;
    });
    if (attrSrcset.length) {
      attrs.value.srcset = attrSrcset;
    }
  }
}
const avifSrcset = computed(() => {
  if (!props.isImgTagOnly && attrs.value.src?.endsWith('.avif.webp')) {
    return (attrs.value.srcset || attrs.value.src)
      .replace(/\.avif\.webp/g, '.avif');
  }
  return null;
});
</script>

<template>
  <picture v-if="avifSrcset">
    <source
      type="image/avif"
      :srcset="avifSrcset"
      :sizes="attrs.sizes"
    />
    <img v-bind="attrs" />
  </picture>
  <img v-else v-bind="attrs" />
</template>
