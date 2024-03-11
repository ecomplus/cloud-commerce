<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
} from 'vue';
import { useElementVisibility } from '@vueuse/core';

export interface Props {
  href?: string | null;
  target?: string;
}

const props = defineProps<Props>();
const link = ref<HTMLElement | null>(null);
const linkTarget = computed(() => {
  if (!props.href) return undefined;
  if (props.target) return props.target;
  if (props.href.startsWith('http')) {
    const domain = globalThis.$storefront.settings.domain || window.location.host;
    if (props.href.startsWith(`https://${domain}`)) return undefined;
    return '_blank';
  }
  return undefined;
});
const checkLinkPrefetch = () => {
  return props.href && !props.href.startsWith('/app/') && !linkTarget.value;
};
if (checkLinkPrefetch()) {
  onMounted(() => {
    const isVisible = useElementVisibility(link.value);
    const unwatch = watch(isVisible, (_isVisible) => {
      if (!_isVisible || !window.$prefetch) return;
      unwatch();
      if (!checkLinkPrefetch()) return;
      window.$prefetch(props.href!);
    }, {
      immediate: true,
    });
  });
}
</script>

<template>
  <component
    ref="link"
    :is="href ? 'a' : 'span'"
    :href="href"
    :target="linkTarget"
    :rel="linkTarget === '_blank' ? 'noopener' : undefined"
  ><slot /></component>
</template>
