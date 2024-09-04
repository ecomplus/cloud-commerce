<script setup lang="ts">
import { ref, computed } from 'vue';

export type Props = {
  href?: string | null;
  target?: string;
  prefetch?: string; /* DEPRECATED */
}
const props = defineProps<Props>();
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
