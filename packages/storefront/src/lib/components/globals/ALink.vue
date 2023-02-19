<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
  href: string;
  target?: string;
}

const props = defineProps<Props>();
const linkTarget = computed(() => {
  if (props.target) return props.target;
  if (props.href.startsWith('http')) {
    const domain = globalThis.storefront.settings.domain || window.location.host;
    if (props.href.startsWith(`https://${domain}`)) return null;
  }
  return '_blank';
});
</script>

<template>
  <a
    :href="href"
    :target="linkTarget"
    :rel="linkTarget === '_blank' ? 'noopener' : null"
  ><slot /></a>
</template>
