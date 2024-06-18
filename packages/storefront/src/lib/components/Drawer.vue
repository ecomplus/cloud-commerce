<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
} from 'vue';

export interface Props {
  isHidden?: boolean;
  placement?: 'start' | 'end' | 'top' | 'bottom';
  position?: 'fixed' | 'absolute';
  animation?: 'slide' | 'scale' | null;
  hasCloseButton?: boolean;
  anchorEl?: HTMLElement | null;
  backdropTarget?: string | null;
  canLockScroll?: boolean;
  maxWidth?: string;
  id?: string;
  popover?: 'auto' | 'manual' | null;
  class?: string | string[] | Record<string, string | null> | null;
  style?: Record<string, string | null> | null;
}

const props = withDefaults(defineProps<Props>(), {
  isHidden: false,
  placement: 'start',
  position: 'fixed',
  animation: 'slide',
  hasCloseButton: true,
  backdropTarget: '#teleported-top',
  canLockScroll: true,
});
const model = defineModel<boolean>({ default: false });
if (!import.meta.env.SSR && props.popover && props.id) {
  const staticPopover = document.querySelector(`#${props.id}`);
  if (staticPopover?.matches(':popover-open')) {
    model.value = true;
  }
}
const close = () => { model.value = false; };
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
watch(model, async (isOpen) => {
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
  watch(model, (isShown) => {
    if (!isShown) {
      animationClassName.value = 'transition scale-90';
    } else {
      nextTick(() => {
        setTimeout(() => {
          animationClassName.value = 'transition';
          setTimeout(() => {
            if (model.value) animationClassName.value = '';
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
const isMounted = ref(false);
onMounted(() => { isMounted.value = true; });
</script>

<template>
  <Fade :slide="slideTo" speed="slow" is-floating>
    <dialog
      v-if="model || popover"
      v-show="!isHidden"
      ref="drawer"
      :id
      :popover
      :open="model"
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
        ...props.style,
        maxWidth: maxWidth
          ? `min(${maxWidth}, calc(100vw - ${scrollbarWidth}px))`
          : !isPlacementX
            ? `calc(100vw - ${scrollbarWidth}px)` : undefined,
      }"
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
      <Teleport v-if="isMounted && backdropTarget" :to="backdropTarget">
        <Fade>
          <div
            v-if="model && !isHidden"
            class="size-screen fixed left-0 top-0 z-30 bg-black/50"
            data-drawer-backdrop
          ></div>
        </Fade>
      </Teleport>
    </dialog>
  </Fade>
</template>
