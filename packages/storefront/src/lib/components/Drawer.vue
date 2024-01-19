<script setup lang="ts">
import {
  toRef,
  ref,
  computed,
  watch,
  nextTick,
} from 'vue';

export interface Props {
  modelValue?: boolean;
  isHidden?: boolean;
  placement?: 'start' | 'end' | 'top' | 'bottom';
  position?: 'fixed' | 'absolute';
  animation?: 'slide' | 'scale' | null;
  hasCloseButton?: boolean;
  anchorEl?: HTMLElement | null;
  backdropTarget?: string | null;
  canLockScroll?: boolean;
  maxWidth?: string;
  class?: string | string[] | Record<string, string | null> | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  isHidden: false,
  placement: 'start',
  position: 'fixed',
  animation: 'slide',
  hasCloseButton: true,
  backdropTarget: '#teleported-top',
  canLockScroll: true,
});
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>();
const close = () => emit('update:modelValue', false);
const drawer = ref<HTMLElement | null>(null);
const outsideClickListener = (ev: MouseEvent) => {
  if (!drawer.value?.contains(ev.target as Node)) {
    if (props.anchorEl?.contains(ev.target as Node)) return;
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
    if (props.canLockScroll) {
      scrollbarWidth.value = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth.value}px`;
    }
    setTimeout(() => {
      document.addEventListener('click', outsideClickListener, { passive: true });
      document.addEventListener('keydown', escClickListener, { passive: true });
    }, 500);
  } else {
    if (props.canLockScroll) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    document.removeEventListener('click', outsideClickListener);
    document.removeEventListener('keydown', escClickListener);
  }
});
const slideTo = computed(() => {
  if (props.animation !== 'slide') return null;
  switch (props.placement) {
    case 'start': return 'left';
    case 'end': return 'right';
    case 'top': return 'down';
    default: return 'up';
  }
});
const animationClassName = ref<string | null>(null);
if (props.animation === 'scale') {
  watch(toRef(props, 'modelValue'), (isShown) => {
    if (!isShown) {
      animationClassName.value = 'transition scale-90';
    } else {
      nextTick(() => {
        setTimeout(() => {
          animationClassName.value = 'transition';
          setTimeout(() => {
            if (props.modelValue) animationClassName.value = '';
          }, 300);
        }, 50);
      });
    }
  }, { immediate: true });
}
const customClassList = computed(() => {
  if (Array.isArray(props.class)) return props.class;
  return [props.class];
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
      v-show="!isHidden"
      ref="drawer"
      class="z-40 w-screen p-0"
      :class="[
        position,
        isPlacementX ? 'm-0' : 'mx-auto',
        isPlacementX && !maxWidth ? 'max-w-sm' : null,
        isFixed ? `top-0 ${(isPlacementX ? 'h-screen' : 'max-h-screen')}` : null,
        isFixed && placement !== 'end' ? 'left-0' : null,
        isFixed && placement === 'end' ? 'left-auto right-0' : null,
        animationClassName,
        ...customClassList,
      ]"
      :style="{
        maxWidth: maxWidth
          ? `min(${maxWidth}, calc(100vw - ${scrollbarWidth}px))`
          : !isPlacementX
            ? `calc(100vw - ${scrollbarWidth}px)` : undefined,
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
          class="absolute top-2 z-30 rounded"
          :class="placement === 'end' ? 'left-2' : 'right-2'"
          data-drawer-close
        >
          <slot name="close">
            <i class="m-0 text-3xl text-base-400 i-close hover:text-base-600"></i>
          </slot>
        </button>
        <slot />
      </div>
      <Teleport v-if="backdropTarget" :to="backdropTarget">
        <Fade>
          <div
            v-if="modelValue && !isHidden"
            class="size-screen fixed left-0 top-0 z-30 bg-black/50"
            data-drawer-backdrop
          ></div>
        </Fade>
      </Teleport>
    </dialog>
  </Fade>
</template>
