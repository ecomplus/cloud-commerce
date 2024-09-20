<script setup lang="ts">
import { type NetworkName, isMobile, socialNetworks } from '@@sf/sf-lib';
import { ref, computed, onMounted } from 'vue';
import SocialNetworkIcon from '@@sf/components/SocialNetworkIcon.vue';

export type Props = {
  network: NetworkName;
  href?: string;
  message?: string;
}
const props = defineProps<Props>();
const wppService = ref('api');
const fixedHref = computed<string>(() => {
  let href = props.href || socialNetworks[props.network] || '';
  if (props.network === 'whatsapp') {
    const tel = href.replace(/[^+\d]/g, '');
    // eslint-disable-next-line prefer-template
    href = `https://${wppService.value}.whatsapp.com/send?phone=`
      + encodeURIComponent(tel.charAt(0) === '+' ? tel : `+55${tel}`);
    if (props.message) {
      href += `&text=${encodeURIComponent(props.message)}`;
    }
  }
  return href;
});
onMounted(() => {
  if (!isMobile) {
    wppService.value = 'web';
  }
});
</script>

<template>
  <ALink :href="fixedHref">
    <slot>
      <SocialNetworkIcon :network="network" />
      <slot name="append"></slot>
    </slot>
  </ALink>
</template>
