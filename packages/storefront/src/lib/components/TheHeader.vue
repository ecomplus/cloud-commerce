<script lang="ts" setup>
export interface Props {
}
</script>

<template>
  <header class="header bg-surface bg-opacity-70 sticky py-1 sm:py-2">
    <div class="container">
      <div class="grid items-center">
        <div class="i-bars-3-bottom-left md:hidden"></div>
        <slot name="logo"></slot>
      </div>
    </div>
  </header>
</template>
