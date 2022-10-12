<script lang="ts" setup>
import HeaderAccountButton, {
  Props as HeaderAccountButtonProps,
} from '@@components/header/HeaderAccountButton.vue';
import HeaderCartButton from '@@components/header/HeaderCartButton.vue';

export interface Props {
  accountUrl?: string;
  cartUrl?: string;
  loginDrawerAdditionalLinks?: HeaderAccountButtonProps['drawerAdditionalLinks'];
}

defineProps<Props>();
</script>

<template>
  <slot name="left" />
  <slot name="account">
    <HeaderAccountButton
      :account-url="accountUrl"
      :drawer-additional-links="loginDrawerAdditionalLinks"
    />
  </slot>
  <slot />
  <slot name="cart">
    <HeaderCartButton :cart-url="cartUrl" />
  </slot>
  <slot name="right" />
</template>
