import type { Customers } from '@cloudcommerce/api/types';
import api from '@cloudcommerce/api';
import { nickname as getNickname } from '@ecomplus/utils';
import { computed } from 'vue';
import {
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
  // updateProfile,
} from 'firebase/auth';
import useStorage from './use-storage';
import '../scripts/firebase-app';

const firebaseAuth = getAuth();
const storageKey = 'SESSION';
const emptySession = {
  customer: {
    display_name: '',
    main_email: '',
  },
  auth: null,
};
const session = useStorage<{
  customer: Partial<Customers>,
  auth: null | {
    access_token: string,
    expires: string,
    customer_id: string,
  },
}>(storageKey, emptySession);

const isAuthenticated = computed(() => {
  const { auth } = session;
  return auth && new Date(auth.expires).getTime() - Date.now() > 1000 * 10;
});
const customer = computed(() => session.customer);
const customerName = computed(() => getNickname(customer.value) as string);
const customerEmail = computed({
  get() {
    return customer.value.main_email;
  },
  set(email) {
    session.customer.main_email = email;
  },
});

const isLogged = computed(() => {
  return isAuthenticated.value || !!firebaseAuth.currentUser?.emailVerified;
});
const logout = () => {
  session.auth = emptySession.auth;
  session.customer = emptySession.customer;
  localStorage.removeItem(storageKey);
  firebaseAuth.signOut();
};

const authenticate = async () => {
  const authToken = await firebaseAuth.currentUser.getIdToken();
  const { domain } = window.storefront.settings;
  try {
    const resAuth = await fetch(`https://${domain}/api/passport/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    session.auth = await resAuth.json();
  } catch (err) {
    console.error(err);
  }
};

const getAccessToken = async () => {
  if (!isAuthenticated.value) {
    await authenticate();
  }
  return session.auth.access_token;
};

const fetchCustomer = async () => {
  const accessToken = await getAccessToken();
  const { data } = await api.get(`customers/${session.auth.customer_id}`, {
    accessToken,
  });
  session.customer = data;
  return data;
};

onAuthStateChanged(firebaseAuth, async (user) => {
  if (user) {
    if (user.displayName && !customerName.value) {
      session.customer.display_name = user.displayName;
    }
    if (user.email && (!customerEmail.value || user.emailVerified)) {
      session.customer.main_email = user.email;
    }
    if (user.emailVerified) {
      const isEmailChanged = user.email !== customerEmail.value;
      if (isEmailChanged || !isAuthenticated.value) {
        await authenticate();
        if (isEmailChanged || !customerName.value) {
          await fetchCustomer();
        }
      }
    }
  } else {
    logout();
  }
});
if (isSignInWithEmailLink(firebaseAuth, window.location.href)) {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  if (email) {
    signInWithEmailLink(firebaseAuth, email, window.location.href)
      .then(() => window.localStorage.removeItem('emailForSignIn'))
      .catch(console.error);
  }
}

export default session;

export {
  session,
  isAuthenticated,
  customer,
  customerName,
  customerEmail,
  isLogged,
  logout,
  authenticate,
  getAccessToken,
  fetchCustomer,
};
