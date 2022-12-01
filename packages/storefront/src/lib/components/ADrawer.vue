<script lang="ts" setup>
import {
  toRef,
  ref,
  computed,
  watch,
} from 'vue';
import { i19close } from '@@i18n';

export interface Props {
  modelValue?: boolean;
  placement?: 'start' | 'end';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  placement: 'end',
});
const emit = defineEmits(['update:modelValue']);
const close = () => emit('update:modelValue', false);
const container = ref(null);
const article = ref(null);
const outsideClickListener = (ev: MouseEvent) => {
  if (!article.value?.contains(ev.target)) {
    close();
  }
};
const escClickListener = (ev: KeyboardEvent) => {
  if (ev.key === 'Escape') {
    close();
  }
};
watch(toRef(props, 'modelValue'), async (isOpen) => {
  const header = container.value.closest('[class*="backdrop-"]');
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
const transition3dTx = computed(() => {
  return props.placement === 'end' ? '100%' : '-100%';
});
</script>

<template>
  <div ref="container">
    <Transition>
      <dialog
        v-if="modelValue"
        class="drawer p-0"
        :class="placement === 'end' ? 'justify-end' : 'justify-start'"
        :open="modelValue"
      >
        <article
          ref="article"
          class="card rounded-none h-full max-h-screen m-0"
        >
          <a
            href="#close"
            :aria-label="i19close"
            class="close"
            data-target="modal-example"
            @click.prevent="close"
          ></a>
          <slot />
        </article>
      </dialog>
    </Transition>
  </div>
</template>

<style>
.drawer.v-enter-active,
.drawer.v-leave-active {
  transition: opacity 0.15s linear;
}
.drawer.v-enter-from,
.drawer.v-leave-to {
  opacity: 0;
}
.drawer.v-enter-active article,
.drawer.v-leave-active article {
  transition: transform 0.25s ease-in-out;
}
.drawer.v-enter-from article,
.drawer.v-leave-to article {
  transform: translate3d(var(--transition-3d-tx), 0, 0);
}
</style>

<style scoped>
.drawer {
  --transition-3d-tx: v-bind(transition3dTx);
}
</style>
