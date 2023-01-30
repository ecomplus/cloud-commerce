<script setup lang="ts">
import StickyHeader from '@@sf/components/StickyHeader.vue';
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
        <div class="md:hidden">
          <button
            class="px-2"
            :aria-label="$t.i19toggleMenu"
            data-sidenav-toggle
          >
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
          class="flex justify-end items-center lg:gap-1 text-base-800"
          data-header-buttons
        >
          <slot name="search-button">
            <button
              class="px-2 py-1"
              :aria-label="$t.i19searchProducts"
              data-header-search-button
            >
              <slot name="search-button-content">
                <i class="i-search hover:text-primary w-7 h-7"></i>
              </slot>
            </button>
          </slot>
          <slot name="account-button">
            <button
              class="hidden sm:block px-2 py-1"
              :aria-label="$t.i19myAccount"
              data-header-account-button
            >
              <slot name="account-button-content">
                <i class="i-account hover:text-primary w-7 h-7"></i>
              </slot>
            </button>
          </slot>
          <slot name="cart-button">
            <button
              class="px-2 py-1"
              :aria-label="$t.i19openCart"
              data-header-cart-button
            >
              <slot name="cart-button-content">
                <i class="i-shopping-cart hover:text-primary w-7 h-7"></i>
              </slot>
            </button>
          </slot>
        </div>
      </slot>
    </div>
  </StickyHeader>
</template>
