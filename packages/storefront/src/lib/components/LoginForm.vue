<script lang="ts" setup>
import { ref } from 'vue';
import {
  i19accessMyAccount,
  i19createAnAccount,
  i19enterWithPassword,
  i19iForgotMyPassword,
  i19password,
  i19send,
  i19sendLoginCodeByEmail,
} from '@i18n';
import '../scripts/firebase-app';
// eslint-disable-next-line import/order
import {
  getAuth,
  signInWithEmailAndPassword,
  // isSignInWithEmailLink,
  // signInWithEmailLink,
} from 'firebase/auth';

const auth = getAuth();
const isLinkSignIn = ref(false);
const email = ref('');
const password = ref('');
const loginWithPassord = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      const { user } = userCredential;
      console.log(user);
    })
    .catch((error) => {
      console.warn(error.code);
      console.error(error);
    });
};
</script>

<template>
  <form
    class="login-form text-base"
    @submit.prevent="loginWithPassord"
  >
    <input
      type="email"
      placeholder="email@mail.com"
      v-model="email"
      required
    >
    <small v-if="isLinkSignIn">
      {{ i19sendLoginCodeByEmail }}
    </small>
    <input
      v-if="!isLinkSignIn"
      type="password"
      class="lowercase"
      :placeholder="i19password"
      v-model="password"
      required
    >
    <small v-show="!isLinkSignIn" class="text-right lowercase">
      <a
        href="#"
        class="text-muted"
        @click.prevent="isLinkSignIn = true"
      >
        {{ i19iForgotMyPassword }}
      </a>
    </small>
    <button type="submit">
      {{ isLinkSignIn ? i19send : i19accessMyAccount }}
    </button>
    <a
      href="#"
      class="block text-center"
      @click.prevent="isLinkSignIn = !isLinkSignIn"
    >
      {{ isLinkSignIn ? i19enterWithPassword : i19createAnAccount }}
    </a>
  </form>
</template>
