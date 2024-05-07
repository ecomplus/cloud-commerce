import { ref, computed, watch } from 'vue';
import { useUrlSearchParams, useThrottleFn } from '@vueuse/core';
import {
  getAuth,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';
import {
  EMAIL_STORAGE_KEY,
  customerEmail as email,
  initializeFirebaseAuth,
  isAuthReady,
} from '@@sf/state/customer-session';

export interface Props {
  canUseUrlParams?: boolean;
}

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const useLoginForm = (props?: Props) => {
  initializeFirebaseAuth();
  const canUseUrlParams = props?.canUseUrlParams !== false;
  const params = canUseUrlParams ? useUrlSearchParams('history') : {};
  const isInitSignUp = params.sign_up !== undefined && params.sign_up !== '0';
  const isInitPasswordSignIn = params.password !== undefined && params.password !== '0';
  const isSignUp = ref(isInitSignUp);
  const isLinkSignIn = ref(!isInitPasswordSignIn);
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
  const isSubmitReady = computed(() => {
    return !isSubmitting.value && isAuthReady.value;
  });
  const emailsSent: string[] = [];
  const submitLogin = useThrottleFn(async (linkActionUrl?: string | null) => {
    if (!email.value) return;
    isSubmitting.value = true;
    if (emailsSent.length) {
      if (emailsSent[emailsSent.length - 1] === email.value) {
        await sleep(3000);
      }
      await sleep(1000 * emailsSent.length);
    }
    const firebaseAuth = getAuth();
    window.localStorage.setItem(EMAIL_STORAGE_KEY, email.value);
    try {
      if (isLinkSignIn.value) {
        const url = new URL(linkActionUrl || window.location.toString());
        url.searchParams.append('email', email.value);
        emailsSent.push(email.value);
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
    isSubmitting.value = false;
  }, 2000);

  const openOauthPopup = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
    const firebaseAuth = getAuth();
    try {
      await signInWithPopup(firebaseAuth, provider);
    } catch (error: any) {
      console.warn(error.code);
      console.error(error);
    }
  };
  const hasGoogleSignIn = computed(() => {
    return window.OAUTH_PROVIDERS?.includes('google');
  });
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return openOauthPopup(provider);
  };
  const hasFacebookeSignIn = computed(() => {
    return window.OAUTH_PROVIDERS?.includes('facebook');
  });
  const signInWithFacebook = () => {
    const provider = new FacebookAuthProvider();
    return openOauthPopup(provider);
  };

  return {
    isLinkSignIn,
    isSignUp,
    email,
    password,
    isSubmitting,
    isSubmitReady,
    submitLogin,
    hasGoogleSignIn,
    signInWithGoogle,
    hasFacebookeSignIn,
    signInWithFacebook,
  };
};

export default useLoginForm;

export { useLoginForm };
