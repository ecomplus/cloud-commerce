<template>
  <header class="bg-surface bg-opacity-70 sticky py-1 sm:py-2">
    <div class="container">
      <div class="grid grid-flow-col auto-cols-max justify-between items-center">
        <slot />
        <div class="flex items-center">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </header>
</template>
