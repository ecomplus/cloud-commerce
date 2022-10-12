<template>
  <div class="grid grid-flow-col auto-cols-max justify-between items-center">
    <slot />
    <div class="flex items-center">
      <slot name="actions" />
    </div>
  </div>
</template>
