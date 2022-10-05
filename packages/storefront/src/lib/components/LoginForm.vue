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
} from '@i18n';
import '../scripts/firebase-app';
// eslint-disable-next-line import/order
import {
  getAuth,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  // isSignInWithEmailLink,
  // signInWithEmailLink,
} from 'firebase/auth';

const auth = getAuth();
const isLinkSignIn = ref(true);
const isSignUp = ref(false);
watch(isSignUp, (_isSignUp) => {
  if (_isSignUp) {
    isLinkSignIn.value = true;
  }
});
const email = ref('');
const password = ref('');
const submitLogin = async () => {
  window.localStorage.setItem('emailForSignIn', email.value);
  try {
    if (isLinkSignIn.value) {
      const url = new URL(window.location.toString());
      url.searchParams.append('email', email.value);
      await sendSignInLinkToEmail(auth, email.value, {
        url: url.toString(),
        handleCodeInApp: true,
      });
    } else {
      const { user } = await signInWithEmailAndPassword(
        auth,
        email.value,
        password.value,
      );
      console.log(user);
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
