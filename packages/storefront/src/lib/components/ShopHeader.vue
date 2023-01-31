<script setup lang="ts">
import { ref } from 'vue';
import { i19myAccount, i19openCart, i19searchProducts } from '@@i18n';
import StickyHeader from '@@sf/components/StickyHeader.vue';

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
</script>

<template>
  <StickyHeader>
    <div
      class="container lg:max-w-7xl mx-auto px-1 lg:pl-3
      grid grid-flow-col grid-cols-3 justify-between items-center
      md:grid-cols-none md:auto-cols-max"
      data-header
    >
      <slot name="sidenav-toggle">
        <div class="md:hidden" data-sidenav-toggle>
          <button class="px-2" :aria-label="$t.i19toggleMenu">
            <slot name="sidenav-toggle-content">
              <i class="i-menu text-base-500 text-3xl"></i>
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
  </StickyHeader>
</template>
