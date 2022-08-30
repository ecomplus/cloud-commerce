import '@cloudcommerce/firebase/lib/init';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
// eslint-disable-next-line import/no-unresolved
import { getAuth } from 'firebase-admin/auth';
// eslint-disable-next-line import/no-unresolved
import { HttpsOptions, onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import servePassportApi from './firebase/serve-passport-api';

// References:
// https:// firebase.google.com/docs/auth/admin/manage-cookies
// https://itnext.io/how-to-use-firebase-auth-with-a-custom-node-backend-99a106376c8a
// https://www.geeksforgeeks.org/firebase-sign-in-with-google-authentication-in-node-js-using-firebase-ui-and-cookie-sessions/
// https://firebase.google.com/docs/reference/rest/auth

const authFirebase = getAuth();
const firestore = getFirestore();

const options = {
  ...config.get().httpsFunctionOptions,
  memory: '128MiB',
} as HttpsOptions;

// eslint-disable-next-line import/prefer-default-export
export const passport = onRequest(options, (req, res) => {
  const { storeId } = config.get();
  servePassportApi(
    req,
    res,
    firestore,
    authFirebase,
    storeId,
  );
});
