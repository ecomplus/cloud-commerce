<script lang="ts" setup>
import { ref, watch } from 'vue';
import {
  i19accessMyAccount,
  i19createAnAccount,
  i19enterWithPassword,
  i19iForgotMyPassword,
  i19password,
  i19sendLoginCodeByEmail,
  i19signUp,
} from '@@i18n';
import {
  getAuth,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  customerName,
  customerEmail as email,
  isLogged,
} from '@@sf/state/customer-session';

// eslint-disable-next-line no-spaced-func, func-call-spacing
const emit = defineEmits<{
  (e: 'set:is-logged', value: boolean): void
  (e: 'set:email', value: string): void
  (e: 'set:customer-name', value: string): void
}>();
watch(isLogged, (_isLogged) => {
  emit('set:is-logged', _isLogged);
  emit('set:customer-name', customerName.value);
}, {
  immediate: true,
});
watch(email, (_email) => {
  emit('set:email', _email);
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
</script>

<template>
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
      <slot name="button-content" v-bind="{ isSignUp }">
        {{ isSignUp ? i19signUp : i19accessMyAccount }}
      </slot>
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
