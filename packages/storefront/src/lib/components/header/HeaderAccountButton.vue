<script lang="ts" setup>
import LoginDrawer, { Props as LoginDrawerProps } from '@@components/LoginDrawer.vue';
import HeaderAccountLink from '@@components/header/HeaderAccountLink.vue';

export interface Props {
  accountUrl?: string;
  drawerAdditionalLinks?: LoginDrawerProps['additionalLinks'];
}

withDefaults(defineProps<Props>(), {
  accountUrl: '/app/account',
});
</script>

<template>
  <LoginDrawer
    :account-url="accountUrl"
    :additional-links="drawerAdditionalLinks"
  >
    <template #toggle>
      <HeaderAccountLink :href="accountUrl" />
    </template>
  </LoginDrawer>
</template>
