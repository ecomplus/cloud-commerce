<script lang="ts" setup>
import { toRefs, ImgHTMLAttributes } from 'vue';
import HeaderWrapper from '@@components/header/HeaderWrapper.vue';
import HeaderLogo from '@@components/header/HeaderLogo.vue';
import HeaderNav from '@@components/header/HeaderNav.vue';

export interface Props {
  logo?: ImgHTMLAttributes;
}

const props = defineProps<Props>();
const { logo } = toRefs(props);
</script>

<template>
  <HeaderWrapper class="header">
    <slot name="aside">
      <div class="header__aside md:hidden">
        <div class="i-bars-3-bottom-left"></div>
      </div>
    </slot>
    <slot name="logo" v-bind="{ logo }">
      <HeaderLogo v-if="logo" :img="logo" />
    </slot>
    <template #actions>
      <slot name="nav">
        <HeaderNav />
      </slot>
      <slot name="search" />
      <slot name="buttons" />
    </template>
  </HeaderWrapper>
</template>
