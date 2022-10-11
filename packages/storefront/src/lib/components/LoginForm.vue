<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useStore } from '@nanostores/vue';
import {
  i19accessMyAccount,
  i19createAnAccount,
  i19enterWithPassword,
  i19hello,
  i19iForgotMyPassword,
  i19password,
  i19sendLoginCodeByEmail,
  i19signUp,
  i19visitor,
} from '@@i18n';
import {
  getAuth,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  customerName as $customerName,
  customerEmail,
  setCustomerEmail,
  isLogged,
} from '@@storefront/state/customer-session';

const emit = defineEmits(['login', 'logout']);
watch(useStore(isLogged), (_isLogged) => {
  emit(_isLogged ? 'login' : 'logout');
}, {
  immediate: true,
});
const isLinkSignIn = ref(true);
const isSignUp = ref(false);
watch(isSignUp, (_isSignUp) => {
  if (_isSignUp) {
    isLinkSignIn.value = true;
  }
});
const email = computed({
  get() {
    return useStore(customerEmail).value;
  },
  set: setCustomerEmail,
});
const password = ref('');
const submitLogin = async () => {
  const firebaseAuth = getAuth();
  window.localStorage.setItem('emailForSignIn', email.value);
  try {
    if (isLinkSignIn.value) {
      const url = new URL(window.location.toString());
      url.searchParams.append('email', email.value);
      await sendSignInLinkToEmail(firebaseAuth, email.value, {
        url: url.toString(),
        handleCodeInApp: true,
      });
    } else {
      await signInWithEmailAndPassword(firebaseAuth, email.value, password.value);
    }
  } catch (error) {
    console.warn(error.code);
    console.error(error);
  }
};
const customerName = useStore($customerName);
</script>

<template>
  <slot name="greetings" v-bind="{ customerName }">
    <div class="text-xl font-medium mb-5">
      {{ `${i19hello} ${customerName || i19visitor}` }}
    </div>
  </slot>
  <form
    class="login-form text-base"
    @submit.prevent="submitLogin"
  >
    <label v-if="isLinkSignIn" for="login-form-email">
      {{ i19sendLoginCodeByEmail }}
    </label>
    <input
      id="login-form-email"
      type="email"
      placeholder="email@mail.com"
      v-model="email"
      required
    >
    <input
      v-if="!isLinkSignIn"
      type="password"
      class="lowercase"
      :placeholder="i19password"
      v-model="password"
      required
    >
    <small v-show="!isSignUp" class="text-right lowercase">
      <a
        href="#"
        class="text-muted"
        @click.prevent="isLinkSignIn = !isLinkSignIn"
      >
        {{ isLinkSignIn ? i19enterWithPassword : i19iForgotMyPassword }}
      </a>
    </small>
    <button type="submit">
      {{ isSignUp ? i19signUp : i19accessMyAccount }}
    </button>
    <a
      href="#"
      class="block text-center"
      @click.prevent="isSignUp = !isSignUp"
    >
      {{ isSignUp ? i19accessMyAccount : i19createAnAccount }}
    </a>
  </form>
</template>
