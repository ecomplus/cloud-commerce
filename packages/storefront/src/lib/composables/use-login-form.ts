import { ref, watch } from 'vue';
import { useUrlSearchParams, useThrottleFn } from '@vueuse/core';
import {
  getAuth,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  EMAIL_STORAGE_KEY,
  customerEmail as email,
  initializeFirebaseAuth,
} from '@@sf/state/customer-session';

export interface Props {
  canUseUrlParams?: boolean;
}

const useLoginForm = (props?: Props) => {
  initializeFirebaseAuth();
  const canUseUrlParams = props?.canUseUrlParams !== false;
  const params = canUseUrlParams ? useUrlSearchParams('history') : {};
  const isInitSignUp = params.sign_up !== undefined && params.sign_up !== '0';
  const isInitPasswordSignIn = params.password !== undefined && params.password !== '0';
  const isSignUp = ref(isInitSignUp);
  const isLinkSignIn = ref(!isInitSignUp && !isInitPasswordSignIn);
  watch(isSignUp, (_isSignUp) => {
    if (_isSignUp) {
      isLinkSignIn.value = true;
      params.sign_up = '1';
    } else {
      params.sign_up = '0';
    }
  });
  watch(isLinkSignIn, (_isLinkSignIn) => {
    params.password = _isLinkSignIn ? '0' : '1';
  });
  const password = ref('');
  const isSubmitting = ref(false);
  const submitLogin = useThrottleFn(async (linkActionUrl?: string | null) => {
    isSubmitting.value = true;
    const timestamp = Date.now();
    const firebaseAuth = getAuth();
    if (!email.value) return;
    window.localStorage.setItem(EMAIL_STORAGE_KEY, email.value);
    try {
      if (isLinkSignIn.value) {
        const url = new URL(linkActionUrl || window.location.toString());
        url.searchParams.append('email', email.value);
        await sendSignInLinkToEmail(firebaseAuth, email.value, {
          url: url.toString(),
          handleCodeInApp: true,
        });
      } else {
        await signInWithEmailAndPassword(
          firebaseAuth,
          email.value,
          password.value,
        );
      }
    } catch (error: any) {
      console.warn(error.code);
      console.error(error);
    }
    setTimeout(() => {
      isSubmitting.value = false;
    }, Math.min(2000 - (Date.now() - timestamp), 1));
  }, 2000);
  return {
    isLinkSignIn,
    isSignUp,
    email,
    password,
    isSubmitting,
    submitLogin,
  };
};

export default useLoginForm;

export { useLoginForm };
