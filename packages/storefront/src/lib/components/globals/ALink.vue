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
const isExternalLink = computed(() => {
  if (props.href?.startsWith('https:')) {
    const domain = globalThis.$storefront.settings.domain || window.location.host;
    if (props.href.startsWith(`https://${domain}`)) return false;
    return true;
  }
  return false;
});
const trackedHref = computed(() => {
  const { domain } = globalThis.$storefront.settings;
  if (!isExternalLink.value || !domain || !props.href) {
    return props.href;
  }
  let arg = '?';
  if (props.href.includes('?')) {
    if (/[?&]ref=/.test(props.href)) return props.href;
    arg = '&';
  }
  return `${props.href}${arg}ref=${domain}`;
});
const linkTarget = computed(() => {
  if (props.target) return props.target;
  if (isExternalLink.value) return '_blank';
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
      if (!window.$interactionOrAwaken) {
        window.addEventListener('firstInteraction', next, { once: true });
      } else {
        window.$interactionOrAwaken.then(next);
      }
    });
  };
  onMounted(() => {
    const { prefetch } = props;
    let isOnVisible = prefetch === 'visible';
    let delayMs = isOnVisible ? 100 : 1;
    if (isMobile && prefetch === 'hover') {
      isOnVisible = true;
      delayMs = 800;
    }
    const isOnHover = !isOnVisible && prefetch === 'hover';
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
      }, delayMs);
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
    :href="trackedHref"
    :target="linkTarget"
    :rel="linkTarget === '_blank' ? 'noopener' : undefined"
  ><slot /></component>
</template>
