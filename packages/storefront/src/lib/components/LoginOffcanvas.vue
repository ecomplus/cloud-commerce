<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue';
import { i19myAccountAndOrders } from '@i18n';
import AOffcanvas from './AOffcanvas.vue';

export interface Props {
  accountUrl?: string;
  accountIconClass?: string;
}

withDefaults(defineProps<Props>(), {
  accountUrl: '/app/account',
  accountIconClass: 'i-user-circle',
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
</script>

<template>
  <div @click="toggle">
    <slot name="toggle" v-bind="{ isVisible }">
      <a :href="accountUrl" :title="i19myAccountAndOrders">
        <div :class="accountIconClass"></div>
      </a>
    </slot>
  </div>
  <AOffcanvas v-model="isVisible" class="login-offcanvas">
    <slot name="form">
      <LoginForm class="max-w-xs" />
    </slot>
  </AOffcanvas>
</template>
