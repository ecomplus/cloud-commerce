<script setup lang="ts">
import type { SettingsContent } from '@@sf/content';
import { computed } from 'vue';

export type Props = {
  as?: string;
  flag: Exclude<SettingsContent['paymentMethods'], undefined>[number];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'i',
});
const iconClassName = computed(() => {
  switch (props.flag) {
    case 'pix': return 'i-pix text-[#77B6A8]';
    case 'visa': return 'i-visa';
    case 'mastercard': return 'i-mastercard';
    case 'elo': return 'i-elo';
    case 'amex': return 'i-amex';
    case 'hipercard': return 'i-hipercard';
    case 'diners': return 'i-dinersclub';
    case 'discover': return 'i-discover';
    default: return '';
  }
});
</script>

<template>
  <b
    v-if="!iconClassName"
    class="mb-1 text-[57%] leading-none tracking-tighter text-black"
  >
    {{ props.flag }}
  </b>
  <component v-else :is="as" :class="iconClassName" />
</template>
