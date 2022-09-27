<script lang="ts" setup>
import {
  toRef,
  ref,
  computed,
  watch,
} from 'vue';
import { i19close } from '@i18n';

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
  if (isOpen) {
    document.body.style.maxWidth = `${document.body.offsetWidth}px`;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.addEventListener('click', outsideClickListener, { passive: true });
      document.addEventListener('keydown', escClickListener, { passive: true });
    }, 500);
  } else {
    document.removeEventListener('click', outsideClickListener);
    document.removeEventListener('keydown', escClickListener);
  }
});
const transition3dTx = computed(() => {
  return props.placement === 'end' ? '100%' : '-100%';
});
</script>

<template>
  <Transition>
    <dialog
      v-if="modelValue"
      class="offcanvas p-0"
      :class="placement === 'end' ? 'justify-end' : 'justify-start'"
      :open="modelValue"
    >
      <article
        ref="article"
        class="rounded-none h-full max-h-screen m-0"
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
</template>

<style>
.offcanvas.v-enter-active,
.offcanvas.v-leave-active {
  transition: opacity 0.25s linear;
}
.offcanvas.v-enter-from,
.offcanvas.v-leave-to {
  opacity: 0;
}
.offcanvas.v-enter-active article,
.offcanvas.v-leave-active article {
  transition: transform 0.3s ease-out;
}
.offcanvas.v-enter-from article,
.offcanvas.v-leave-to article {
  transform: translate3d(var(--transition-3d-tx), 0, 0);
}
</style>

<style scoped>
.offcanvas {
  --transition-3d-tx: v-bind(transition3dTx);
}
</style>
