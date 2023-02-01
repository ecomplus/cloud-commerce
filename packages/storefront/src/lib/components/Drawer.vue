<script setup lang="ts">
import {
  toRef,
  ref,
  computed,
  watch,
} from 'vue';
import useComponentVariant from '@@sf/composables/use-component-variant';

export interface Props {
  modelValue?: boolean;
  placement?: 'start' | 'end' | 'top' | 'bottom';
  isTeleported?: boolean;
  hasCloseButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  placement: 'start',
  isTeleported: false,
  hasCloseButton: true,
});
const emit = defineEmits([
  'update:modelValue',
]);
const close = () => emit('update:modelValue', false);
const anchor = ref(null);
const canvas = ref(null);
const outsideClickListener = (ev: MouseEvent) => {
  if (!canvas.value?.contains(ev.target)) {
    close();
  }
};
const escClickListener = (ev: KeyboardEvent) => {
  if (ev.key === 'Escape') {
    close();
  }
};
watch(toRef(props, 'modelValue'), async (isOpen) => {
  const header = anchor.value.closest('[class*="backdrop-"]');
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    if (header) {
      header.style.backdropFilter = 'none';
    }
    setTimeout(() => {
      document.addEventListener('click', outsideClickListener, { passive: true });
      document.addEventListener('keydown', escClickListener, { passive: true });
    }, 500);
  } else {
    document.body.style.overflow = null;
    if (header) {
      setTimeout(() => {
        header.style.backdropFilter = null;
      }, 500);
    }
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
const componentVariant = useComponentVariant(props, ['placement']);
</script>

<template>
  <div ref="anchor" class="relative">
    <Teleport to="#teleported" :disabled="!isTeleported">
      <Fade :slide="slideTo" speed="slow" is-floating>
        <dialog
          v-if="modelValue"
          class="w-screen max-w-sm p-0 z-50"
          :class="isTeleported ? 'fixed top-0 left-0' : 'absolute'"
          :open="modelValue"
          :data-drawer="componentVariant"
        >
          <div ref="canvas" class="relative">
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
        </dialog>
      </Fade>
    </Teleport>
  </div>
</template>
