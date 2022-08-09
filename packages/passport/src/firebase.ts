/* eslint-disable import/prefer-default-export */
import type { Request, Response } from 'firebase-functions';
import type { Customers } from '@cloudcommerce/types';
import 'source-map-support/register.js';
// eslint-disable-next-line import/no-unresolved
import { initializeApp } from 'firebase-admin/app';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
// eslint-disable-next-line import/no-unresolved
import { getAuth } from 'firebase-admin/auth';
// eslint-disable-next-line import/no-unresolved
import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import getEnv from '@cloudcommerce/firebase/lib/env';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {
  readStore, checkAuthFirebase, sendError, findCustomerByEmail, getAuthCustomerApi, createCustomer,
} from './firebase/utils';

// References:
// https:// firebase.google.com/docs/auth/admin/manage-cookies
// https://itnext.io/how-to-use-firebase-auth-with-a-custom-node-backend-99a106376c8a
// https://www.geeksforgeeks.org/firebase-sign-in-with-google-authentication-in-node-js-using-firebase-ui-and-cookie-sessions/

initializeApp();
const auth = getAuth();
const firestore = getFirestore();

const options = config.get().httpsFunctionOptions;

const app = express();
const projectId = ''; // TODO: Get project Id in firebase
const baseUri = `/${projectId}/${options.region}/passport`;
const providerOptions = [
  'Email',
  'Google',
  'Facebook',
  'Github',
];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const root = process.cwd();
// set the view engine to ejs
const dirViews = 'node_modules/@cloudcommerce/passport';
app.set('views', `${root}/${dirViews}/assets/views`);
app.set('view engine', 'ejs');

app.get('/:lang/:storeId/:id/login.html', async (req:Request, res:Response) => {
  const { storeId } = req.params;
  const { authenticationId, apiKey } = getEnv();
  const store = await readStore({ authenticationId, apiKey });
  // https://firebase.google.com/docs/auth/web/firebaseui
  if (store && storeId === `${config.get().storeId}`) {
    res.render('login', { store, providerOptions, baseUri });
  } else {
    res.status(404).send('Store not found');
  }
});

app.post('/:store/identify', async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.store, 10);
  const { authtoken } = req.headers;
  const customerAuth = await checkAuthFirebase(auth, authtoken);

  const { authenticationId, apiKey } = getEnv();

  if (customerAuth !== null && firestore && storeId > 100) {
    const customer = await findCustomerByEmail(
      customerAuth.email,
      { authenticationId, apiKey },
    );
    if (customer != null) {
      // check acess token and return custumer _id and acess token
      await getAuthCustomerApi(firestore, customer._id, { authenticationId, apiKey }, res);
    } else {
      // account not found
      // create customer in API, checke authentication in api,
      // return custummer_id and acess token
      const profile = {
        display_name: customerAuth.name || '',
        main_email: customerAuth.email,
        emails: [{
          address: customerAuth.email,
          verified: customerAuth.email_verified,
        }],
        oauth_providers: [{
          provider: customerAuth.firebase.sign_in_provider,
          user_id: customerAuth.user_id,
        }],
      } as Customers;
      const customerId = await createCustomer(profile, { authenticationId, apiKey });
      if (customerId) {
        await getAuthCustomerApi(firestore, customerId, { authenticationId, apiKey }, res);
      }
    }
  } else if (customerAuth === null) {
    sendError(res, 'Invalid Token, Unauthorized', 403);
  } else if (!firestore) {
    sendError(res, 'Firestore not found', 500);
  } else {
    sendError(res, 'Invalid Store');
  }
});

export const passport = onRequest(options, app);
