<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue';
import {
  i19myAccountAndOrders,
  i19myAccount,
  i19myOrders,
} from '@i18n';
import ADrawer from './ADrawer.vue';

export interface Props {
  accountUrl?: string;
  accountIconClass?: string;
  additionalLinks?: Array<{
    href: string;
    isBlank?: boolean;
    innerHTML: string;
  }>;
}

withDefaults(defineProps<Props>(), {
  accountUrl: '/app/account',
  accountIconClass: 'i-user-circle',
  additionalLinks: () => [],
});
const isVisible = ref(false);
const loadingLoginForm = !import.meta.env.SSR
  ? import('./LoginForm.vue')
  : Promise.resolve() as Promise<any>;
const LoginForm = defineAsyncComponent(() => loadingLoginForm);
const toggle = (ev: MouseEvent) => {
  loadingLoginForm.then(() => {
    isVisible.value = !isVisible.value;
    ev.preventDefault();
  });
};
const isLogged = ref(false);
</script>

<template>
  <div @click="toggle">
    <slot name="toggle" v-bind="{ isVisible }">
      <a :href="accountUrl" :title="i19myAccountAndOrders">
        <div :class="accountIconClass"></div>
      </a>
    </slot>
  </div>
  <ADrawer v-model="isVisible" class="login-offcanvas">
    <slot name="form">
      <LoginForm
        class="w-80"
        @login="isLogged = true"
        @logout="isLogged = false"
      />
    </slot>
    <slot name="nav" v-bind="{ isLogged }">
      <hr>
      <aside>
        <nav>
          <ul>
            <template v-if="isLogged">
              <li><a :href="`${accountUrl}/#/orders`">{{ i19myOrders }}</a></li>
              <li><a :href="accountUrl">{{ i19myAccount }}</a></li>
            </template>
            <li
              v-for="({ href, isBlank, innerHTML }, i) in additionalLinks"
              :key="i"
            >
              <a
                :href="href"
                :target="isBlank ? '_blank' : null"
                :rel="isBlank ? 'noopener' : null"
                v-html="innerHTML"
              ></a>
            </li>
          </ul>
        </nav>
      </aside>
    </slot>
  </ADrawer>
</template>
