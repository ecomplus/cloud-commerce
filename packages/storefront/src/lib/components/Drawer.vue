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
watch(toRef(props, 'modelValue'), async (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.addEventListener('click', outsideClickListener, { passive: true });
      document.addEventListener('keydown', escClickListener, { passive: true });
    }, 500);
  } else {
    document.body.style.overflow = null;
    document.removeEventListener('click', outsideClickListener);
    document.removeEventListener('keydown', escClickListener);
  }
});
const slideTo = computed(() => {
  switch (props.placement) {
    case 'start': return 'left';
    case 'end': return 'right';
    case 'top': return 'up';
    default: return 'down';
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
      class="w-screen max-w-sm shadow p-0 m-0 z-50"
      :class="[
        position,
        isFixed ? `top-0 left-0 ${(isPlacementX ? 'h-screen' : '')}` : null,
      ]"
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
