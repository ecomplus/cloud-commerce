<template>
  <div class="counter">
    <button @click="subtract()">-</button>
    <pre>{{ count }}</pre>
    <button @click="add()">+</button>
  </div>
  <div class="counter-message">
    <slot />
  </div>
  <div id="firebaseui-auth-container"></div>
</template>

<script lang="ts">
import { ref } from 'vue';
import config from '@cloudcommerce/config';

const setupFirebaseUi = async () => {
  const { lang } = config.get();
  import('../../assets/firebaseui.css');

  await Promise.all([
    import('firebase/compat/auth'),
    new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth__${lang}.js`;
      script.onload = resolve;
      script.onerror = reject;
      script.async = true;
      document.body.appendChild(script);
    }),
  ]);
  const { firebase, firebaseui }: { firebase: any, firebaseui: any } = window;
  const ui = new firebaseui.auth.AuthUI(firebase.auth());
  console.log(firebase.auth);
  const uiConfig = {
    signInSuccessUrl: '<url-to-redirect-to-on-success>',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      // firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
    ],
    // tosUrl and privacyPolicyUrl accept either url string or a callback
    // function.
    // Terms of service url/callback.
    tosUrl: '<your-tos-url>',
    // Privacy policy url/callback.
    privacyPolicyUrl: '<your-privacy-policy-url>',
  };
  ui.start('#firebaseui-auth-container', uiConfig);
};

export default {
  setup() {
    if (!import.meta.env.SSR) {
      setupFirebaseUi();
    }
    const count = ref(0);
    const add = () => {
      count.value += 1;
    };
    const subtract = () => {
      count.value -= 1;
    };
    return {
      count,
      add,
      subtract,
    };
  },
};
</script>

<style>
.counter {
  display: grid;
  font-size: 2em;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 2em;
  place-items: center;
}
.counter-message {
  text-align: center;
}
</style>
