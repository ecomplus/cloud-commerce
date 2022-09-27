<script lang="ts" setup>
import { ref } from 'vue';
import {
  i19login,
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
  <form @submit.prevent="loginWithPassord">
    <input
      ref="input"
      type="email"
      placeholder="email@mail.com"
      v-model="email"
      required
    >
    <input
      ref="input"
      type="password"
      placeholder="***"
      v-model="password"
      required
    >
    <button
      type="submit"
      class="btn btn-block btn-primary"
    >
      {{ i19login }}
    </button>
  </form>
</template>
