<script lang="ts" setup>
import { toRefs, ImgHTMLAttributes } from 'vue';
import HeaderWrapper from '@@components/header/HeaderWrapper.vue';
import HeaderButtons from '@@components/header/HeaderButtons.vue';

export interface Props {
  logo?: ImgHTMLAttributes;
  gridClass?: string;
  actionsGridClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  gridClass: 'grid grid-flow-col auto-cols-max justify-between items-center',
  actionsGridClass: 'grid items-center text-2xl',
});
const { logo } = toRefs(props);
</script>

<template>
  <HeaderWrapper class="header">
    <div :class="gridClass">
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
      <slot name="actions-grid">
        <div :class="actionsGridClass">
          <slot name="nav" />
          <slot name="search" />
          <slot name="buttons">
            <HeaderButtons>
              <template #account>
                <slot name="account" />
              </template>
            </HeaderButtons>
          </slot>
        </div>
      </slot>
    </div>
  </HeaderWrapper>
</template>
