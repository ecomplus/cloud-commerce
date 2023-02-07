<script setup lang="ts">
import type { CategoriesList } from '@cloudcommerce/api/types';
import { ref, computed } from 'vue';
import { i19myAccount, i19openCart, i19searchProducts } from '@@i18n';
import useStickyHeader from '@@sf/composables/use-sticky-header';
import Drawer from '@@sf/components/Drawer.vue';
import ShopSidenav from '@@sf/components/ShopSidenav.vue';

export interface Props {
  categories: CategoriesList;
}

defineProps<Props>();
const buttons = ref({
  search: {
    icon: 'i-search',
    onClick: () => {},
    label: i19searchProducts,
  },
  account: {
    icon: 'i-account',
    onClick: () => {},
    label: i19myAccount,
  },
  cart: {
    icon: 'i-shopping-cart',
    onClick: () => {},
    label: i19openCart,
  },
});
const isSidenavOpen = ref(false);
const header = ref<HTMLElement | null>(null);
const {
  isSticky,
  staticHeight,
  staticY,
} = useStickyHeader({ header });
const sidenavHeight = computed(() => {
  return isSticky.value ? staticHeight.value : staticY.value;
});
</script>

<template>
  <header
    ref="header"
    class="top-0 z-50"
    :class="isSticky
      ? 'bg-white/80 backdrop-blur-md shadow py-2 md:py-3'
      : 'bg-white py-3 sm:py-4 md:py-5'"
  >
    <div class="container lg:max-w-7xl mx-auto px-1 lg:pl-3
      grid grid-flow-col grid-cols-3 justify-between items-center
      md:grid-cols-none md:auto-cols-max">
      <slot name="sidenav-toggle">
        <div class="md:hidden" data-sidenav-toggle>
          <button
            class="px-2 my-1"
            :aria-label="$t.i19toggleMenu"
            @click="isSidenavOpen = !isSidenavOpen"
          >
            <slot name="sidenav-toggle-content">
              <i
                class="text-base-500 text-3xl"
                :class="isSidenavOpen ? 'i-close' : 'i-menu'"
              ></i>
            </slot>
          </button>
        </div>
      </slot>
      <slot name="logo" />
      <slot name="nav" />
      <slot name="buttons">
        <div
          class="px-2 flex justify-end items-center gap-3 lg:gap-4 text-base-800"
          data-header-buttons
        >
          <slot
            name="button"
            v-for="({ icon, onClick, label }, name) in buttons"
            :key="name"
            v-bind="{ name, icon, onClick }"
          >
            <button
              :class="name === 'account' ? 'hidden sm:block' : null"
              :aria-label="label"
              @click="onClick"
              :data-header-button="name"
            >
              <slot name="button-content" v-bind="{ name, icon }">
                <i
                  :class="icon"
                  class="hover:text-primary w-7 h-7 hover:scale-110 active:scale-125"
                ></i>
              </slot>
            </button>
          </slot>
        </div>
      </slot>
    </div>
    <Drawer
      v-model="isSidenavOpen"
      :has-close-button="false"
      position="absolute"
      class="mt-3"
      :style="{ height: `calc(100vh - ${sidenavHeight}px)` }"
    >
      <ShopSidenav class="pt-6" :categories="categories" />
    </Drawer>
  </header>
</template>
