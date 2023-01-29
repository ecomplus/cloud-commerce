<script setup lang="ts">
import StickyHeader from '@@sf/components/StickyHeader.vue';
</script>

<template>
  <StickyHeader>
    <div
      class="container mx-auto px-1 lg:pl-3
      grid grid-flow-col grid-cols-3 justify-between items-center
      md:grid-cols-none md:auto-cols-max"
      data-header
    >
      <slot name="aside">
        <div class="md:hidden" data-header-aside>
          <button
            class="text-base-500 text-3xl px-2"
            :aria-label="$t.i19toggleMenu"
          >
            <i class="i-menu"></i>
          </button>
        </div>
      </slot>
      <slot name="logo" />
      <slot name="nav" />
      <slot name="buttons">
        <div
          class="flex justify-end items-center lg:gap-1 text-base-800"
          data-header-buttons
        >
          <slot name="search-button">
            <button
              class="hover:text-primary px-2 py-1"
              :aria-label="$t.i19searchProducts"
              data-header-search-button
            >
              <i class="i-search w-7 h-7"></i>
            </button>
          </slot>
          <slot name="account-button">
            <button
              class="hidden sm:block hover:text-primary px-2 py-1"
              :aria-label="$t.i19myAccount"
              data-header-account-button
            >
              <i class="i-account w-7 h-7"></i>
            </button>
          </slot>
          <slot name="cart-button">
            <button
              class="hover:text-primary px-2 py-1"
              :aria-label="$t.i19openCart"
              data-header-cart-button
            >
              <i class="i-shopping-cart w-7 h-7"></i>
            </button>
          </slot>
        </div>
      </slot>
    </div>
  </StickyHeader>
</template>
