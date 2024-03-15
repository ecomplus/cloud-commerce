<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
} from 'vue';
import { useElementVisibility, useElementHover } from '@vueuse/core';
import { isMobile, requestIdleCallback } from '@@sf/sf-lib';

export interface Props {
  href?: string | null;
  target?: string;
  prefetch?: 'hover' | 'visible' | 'never';
}

const props = withDefaults(defineProps<Props>(), {
  prefetch: 'hover',
});
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
const prefetchHref = computed(() => {
  if (import.meta.env.SSR || !props.href || linkTarget.value) return null;
  const pathname = props.href.replace(/^(https:\/\/[^/]+)?([^#?]+).*$/i, '$2');
  if (pathname.startsWith('/app/') || pathname === window.location.pathname) {
    return null;
  }
  return pathname;
});
if (prefetchHref.value) {
  const prefetchOnNext = () => {
    requestIdleCallback(() => {
      const next = () => {
        if (!prefetchHref.value) return;
        window.$prefetch!(prefetchHref.value);
      };
      if (!window.$firstInteraction) {
        window.addEventListener('firstInteraction', next, { once: true });
      } else {
        window.$firstInteraction.then(next);
      }
    });
  };
  onMounted(() => {
    const { prefetch } = props;
    const isOnHover = prefetch === 'hover';
    if (isMobile && isOnHover) return;
    const isOnVisible = prefetch === 'visible';
    const useElementEv = isOnVisible
      ? useElementVisibility
      : isOnHover && useElementHover;
    if (!useElementEv) return;
    const isActive = useElementEv(link.value);
    const unwatch = watch(isActive, (_isActive) => {
      if (!_isActive || !window.$prefetch) return;
      unwatch();
      setTimeout(() => {
        if (isOnVisible && !isActive.value) return;
        prefetchOnNext();
      }, isOnVisible ? 100 : 1);
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
