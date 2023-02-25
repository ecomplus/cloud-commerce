<script setup lang="ts">
import {
  toRef,
  ref,
  computed,
  watch,
} from 'vue';

export interface Props {
  modelValue?: boolean;
  placement?: 'start' | 'end' | 'top' | 'bottom';
  position?: 'fixed' | 'absolute';
  hasCloseButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  placement: 'start',
  position: 'fixed',
  hasCloseButton: true,
});
const emit = defineEmits([
  'update:modelValue',
]);
const close = () => emit('update:modelValue', false);
const drawer = ref(null);
const outsideClickListener = (ev: MouseEvent) => {
  if (!drawer.value?.contains(ev.target)) {
    close();
  }
};
const escClickListener = (ev: KeyboardEvent) => {
  if (ev.key === 'Escape') {
    close();
  }
};
const scrollbarWidth = ref(0);
watch(toRef(props, 'modelValue'), async (isOpen) => {
  if (isOpen) {
    scrollbarWidth.value = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth.value}px`;
    setTimeout(() => {
      document.addEventListener('click', outsideClickListener, { passive: true });
      document.addEventListener('keydown', escClickListener, { passive: true });
    }, 500);
  } else {
    document.body.style.overflow = null;
    document.body.style.paddingRight = null;
    document.removeEventListener('click', outsideClickListener);
    document.removeEventListener('keydown', escClickListener);
  }
});
const slideTo = computed(() => {
  switch (props.placement) {
    case 'start': return 'left';
    case 'end': return 'right';
    case 'top': return 'down';
    default: return 'up';
  }
});
const isFixed = computed(() => {
  return props.position === 'fixed';
});
const isPlacementX = computed(() => {
  return props.placement === 'start' || props.placement === 'end';
});
</script>

<template>
  <Fade :slide="slideTo" speed="slow" is-floating>
    <dialog
      v-if="modelValue"
      ref="drawer"
      class="w-screen shadow p-0 m-0 z-50"
      :class="[
        position,
        isFixed ? `top-0 left-0 ${(isPlacementX ? 'h-screen' : '')}` : null,
        isPlacementX ? 'max-w-sm' : null,
      ]"
      :style="{
        maxWidth: !isPlacementX ? `calc(100vw - ${scrollbarWidth}px)` : null,
      }"
      :open="modelValue"
      :data-drawer="placement"
    >
      <div class="relative h-full">
        <button
          v-if="hasCloseButton"
          type="button"
          :aria-label="$t.i19close"
          @click.prevent="close"
          class="absolute top-2"
          :class="placement === 'end' ? 'left-2' : 'right-2'"
          data-drawer-close
        >
          <slot name="close">
            <i class="i-close text-base-400 text-3xl"></i>
          </slot>
        </button>
        <slot />
      </div>
      <Teleport to="#teleported-top">
        <Fade>
          <div
            v-if="modelValue"
            class="fixed top-0 left-0 w-screen h-screen bg-black/50 z-40"
            data-drawer-backdrop
          ></div>
        </Fade>
      </Teleport>
    </dialog>
  </Fade>
</template>
