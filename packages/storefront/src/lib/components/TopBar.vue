<script lang="ts" setup>
import type CmsHeader from '../../types/cms-header';
import type CmsContacts from '../../types/cms-contacts';

export interface Props {
  marketingStripe: CmsHeader['marketing_stripe'];
  hasNavbar?: boolean;
  pageLinks: CmsHeader['contacts_stripe']['pages'];
  contacts: CmsContacts;
  hasPhoneLinks?: boolean;
  hasNetworkLinks?: boolean;
  socialNetworks?: string[];
}

withDefaults(defineProps<Props>(), {
  hasNavbar: true,
  hasPhoneLinks: true,
  hasNetworksLinks: true,
  socialNetworks() {
    return ['facebook', 'twitter', 'youtube', 'pinterest', 'instagram', 'tiktok'];
  },
});
</script>

<template>
  <div class="top-bar w-full bg-surface">
    <slot name="countdown" v-bind="{ marketingStripe }">
      <template v-if="marketingStripe && marketingStripe.text">
        <component
          :is="marketingStripe.link ? 'a' : 'div'"
          class="top-bar__countdown block text-sm text-center p-1
            whitespace-nowrap overflow-x-auto"
          :class="marketingStripe.link ? 'primary' : 'secondary'"
          :href="marketingStripe.link"
        >
          {{ marketingStripe.text }}
        </component>
      </template>
    </slot>
    <div
      v-if="hasNavbar"
      class="top-bar__nav hidden md:block py-2"
    >
      <div class="container">
        <div class="flex items-center lg:px-2 xl:px-4">
          <div class="grow text-xs">
            <slot name="page-links" v-bind="{ pageLinks }">
              <nav
                v-if="pageLinks"
                class="top-bar__page-links inline-block mr-4 font-semibold"
              >
                <a
                  v-for="({ link, title }, i) in pageLinks"
                  class="mr-2 lg:mr-3"
                  :key="i"
                  :href="link"
                >
                  {{ title }}
                </a>
              </nav>
            </slot>
            <slot
              name="contact-links"
              v-bind="{ contacts, hasPhoneLinks }"
            >
              <div
                v-if="hasPhoneLinks"
                class="top-bar__contact-links inline-block"
              >
                <a
                  v-if="contacts.whatsapp"
                  href="javascript:;"
                  target="_blank"
                  rel="noopener"
                  :data-whatsapp-tel="contacts.whatsapp.replace(/\D/g, '')"
                  class="mr-2"
                >
                  <i class="i-whatsapp"></i>
                  {{ contacts.whatsapp }}
                </a>
                <a
                  v-if="contacts.phone && contacts.phone !== contacts.whatsapp"
                  :href="`tel:+${contacts.phone.replace(/\D/g, '')}`"
                  target="_blank"
                  rel="noopener"
                  class="mr-2"
                >
                  <i class="i-phone"></i>
                  {{ contacts.phone }}
                </a>
              </div>
            </slot>
          </div>
          <slot
            name="social-networks"
            v-bind="{ contacts, hasNetworkLinks }"
          >
            <div
              v-if="hasNetworkLinks"
              class="top-bar__social-networks leading-none"
            >
              <template v-for="network in socialNetworks">
                <template v-if="contacts[network]">
                  <a
                    :key="network"
                    :href="contacts[network]"
                    target="_blank"
                    rel="noopener"
                    class="ml-1"
                    :aria-label="`Follow on ${network}`"
                  >
                    <i v-if="network === 'facebook'" class="i-facebook"></i>
                    <i v-else-if="network === 'youtube'" class="i-youtube"></i>
                    <i v-else-if="network === 'twitter'" class="i-twitter"></i>
                    <i v-else-if="network === 'pinterest'" class="i-pinterest"></i>
                    <i v-else-if="network === 'instagram'" class="i-instagram"></i>
                    <i v-else-if="network === 'tiktok'" class="i-tiktok"></i>
                  </a>
                </template>
              </template>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.top-bar__nav a:not(:hover) {
  color: var(--gray);
}
</style>
