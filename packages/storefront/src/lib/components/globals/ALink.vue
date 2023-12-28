<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
  href?: string | null;
  target?: string;
}

const props = defineProps<Props>();
const linkTarget = computed(() => {
  if (!props.href) return undefined;
  if (props.target) return props.target;
  if (props.href.startsWith('http')) {
    const domain = globalThis.$storefront.settings.domain || window.location.host;
    if (props.href.startsWith(`https://${domain}`)) return undefined;
  }
  return undefined;
});
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    :href="href"
    :target="linkTarget"
    :rel="linkTarget === '_blank' ? 'noopener' : undefined"
  ><slot /></component>
</template>
