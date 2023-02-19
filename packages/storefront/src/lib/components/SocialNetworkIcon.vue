<script setup lang="ts">
import type { NetworkName } from '@@sf/server-data';
import { computed } from 'vue';

export interface Props {
  as?: string;
  network: NetworkName;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'i',
});
const iconClassName = computed(() => {
  switch (props.network) {
    case 'facebook': return 'i-facebook';
    case 'instagram': return 'i-instagram';
    case 'whatsapp': return 'i-whatsapp';
    case 'youtube': return 'i-youtube';
    case 'pinterest': return 'i-pinterest';
    case 'tiktok': return 'i-tiktok';
    case 'twitter': return 'i-twitter';
    default: return '';
  }
});
</script>

<template>
  <component :is="as" :class="iconClassName" />
</template>
