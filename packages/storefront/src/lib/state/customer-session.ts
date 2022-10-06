import type { Customers } from '@cloudcommerce/api/types';
import api from '@cloudcommerce/api';
import { nickname as getNickname } from '@ecomplus/utils';
import { map, computed, onSet } from 'nanostores';
import {
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
  // updateProfile,
} from 'firebase/auth';
import '../scripts/firebase-app';

const session = map<{
  customer: Partial<Customers>,
  auth: null | {
    access_token: string,
    expires: string,
    customer_id: string,
  },
}>({
  customer: {
    display_name: '',
    main_email: '',
  },
  auth: null,
});
const storageKey = 'SESSION';
const sessionJson = localStorage.getItem(storageKey);
if (sessionJson) {
  try {
    session.set(JSON.parse(sessionJson));
  } catch (e) {
    localStorage.removeItem(storageKey);
  }
}
onSet(session, () => {
  localStorage.setItem(storageKey, JSON.stringify(session.get()));
});

const isAuthorized = computed(session, ({ auth }) => {
  return auth && new Date(auth.expires).getTime() - Date.now() > 1000 * 10;
});
const customer = computed(session, (_session) => _session.customer);
const customerName = computed(customer, (_customer) => getNickname(_customer));
const customerEmail = computed(customer, (_customer) => _customer.main_email);

const setCustomerEmail = (email: string) => session.setKey('customer', {
  ...customer.get(),
  main_email: email,
});

const logout = () => {
  session.set({
    customer: {
      display_name: '',
      main_email: '',
    },
    auth: null,
  });
  localStorage.removeItem(storageKey);
};

const firebaseAuth = getAuth();
if (isSignInWithEmailLink(firebaseAuth, window.location.href)) {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  if (email) {
    signInWithEmailLink(firebaseAuth, email, window.location.href)
      .catch(console.error);
  }
}

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
    const auth = await resAuth.json();
    session.set({ auth, customer: customer.get() });
  } catch (err) {
    console.error(err);
  }
};

const getAccessToken = async () => {
  if (!isAuthorized.get()) {
    await authenticate();
  }
  return session.get().auth.access_token;
};

const fetchCustomer = async () => {
  const accessToken = await getAccessToken();
  const { auth } = session.get();
  const { data } = await api.get(`customers/${auth.customer_id}`, {
    accessToken,
  });
  session.set({ customer: data, auth });
  return data;
};

onAuthStateChanged(firebaseAuth, async (user) => {
  if (user) {
    if (user.emailVerified) {
      const isEmailChanged = user.email !== customerEmail.get();
      if (isEmailChanged || !isAuthorized.get()) {
        await authenticate();
        if (isEmailChanged || !customerName.get()) {
          await fetchCustomer();
        }
      }
    }
  } else {
    logout();
  }
});

export default session;

export {
  session,
  isAuthorized,
  customer,
  customerName,
  customerEmail,
  setCustomerEmail,
  logout,
  authenticate,
  getAccessToken,
  fetchCustomer,
};
