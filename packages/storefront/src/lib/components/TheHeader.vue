<script lang="ts" setup>
import type { ImgHTMLAttributes } from 'vue';
import HeaderWrapper from '@@components/header/HeaderWrapper.vue';
import HeaderGrid from '@@components/header/HeaderGrid.vue';
import HeaderLogo from '@@components/header/HeaderLogo.vue';

export interface Props {
  logo?: ImgHTMLAttributes;
}

defineProps<Props>();
</script>

<template>
  <HeaderWrapper class="header">
    <HeaderGrid>
      <slot name="aside">
        <div class="header__aside md:hidden">
          <div class="i-bars-3-bottom-left"></div>
        </div>
      </slot>
      <slot name="logo" v-bind="{ logo }">
        <HeaderLogo v-if="logo" :img="logo" />
      </slot>
      <template #actions>
        <slot name="nav" />
        <slot name="search" />
        <slot name="buttons" />
      </template>
    </HeaderGrid>
  </HeaderWrapper>
</template>
