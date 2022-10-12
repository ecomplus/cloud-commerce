<script lang="ts" setup>
import { toRefs, ImgHTMLAttributes } from 'vue';
import HeaderWrapper from '@@components/header/HeaderWrapper.vue';
import HeaderNav from '@@components/header/HeaderNav.vue';
import HeaderButtons from '@@components/header/HeaderButtons.vue';

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
      <a v-if="logo" href="/" class="header__logo">
        <component :is="logo.alt ? 'h1' : 'span'" class="m-0">
          <img v-bind="logo" />
        </component>
      </a>
    </slot>
    <template #actions>
      <slot name="nav">
        <HeaderNav />
      </slot>
      <slot name="search" />
      <slot name="buttons">
        <HeaderButtons>
          <template #account>
            <slot name="account" />
          </template>
        </HeaderButtons>
      </slot>
    </template>
  </HeaderWrapper>
</template>
