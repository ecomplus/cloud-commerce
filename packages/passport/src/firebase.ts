import type { Request, Response } from 'firebase-functions';
import { Endpoint } from '@cloudcommerce/api/src/types';
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
import env from '@cloudcommerce/firebase/lib/env';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {
  readStore, sendError, getAuthCustomerApi, callApi,
} from './firebase/handle-passport';

// References:
// https:// firebase.google.com/docs/auth/admin/manage-cookies
// https://itnext.io/how-to-use-firebase-auth-with-a-custom-node-backend-99a106376c8a
// https://www.geeksforgeeks.org/firebase-sign-in-with-google-authentication-in-node-js-using-firebase-ui-and-cookie-sessions/

initializeApp();
const authFirebase = getAuth();
const firestore = getFirestore();

const options = config.get().httpsFunctionOptions;

const app = express();
const projectId = process.env.FIREBASE_PROJECT_ID || 'ecom2-hello'; // TODO: Get project Id in firebase
const baseUri = `/${projectId}/${options.region}/passport`; // using front-end
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

app.get('/:lang/:storeId/:id/login.html', async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { apiAuth } = env();

  const store = await readStore(apiAuth);
  // https://firebase.google.com/docs/auth/web/firebaseui
  if (store && storeId === `${config.get().storeId}`) {
    res.render('login', { store, providerOptions, baseUri });
  } else {
    res.status(404).send('Store not found');
  }
});

app.post('/:store/identify', async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.store, 10);
  const { apiAuth } = env();
  const { authtoken } = req.headers;
  if (!firestore) {
    sendError(res, 'Firestore not found', 500);
  } else if (storeId < 100) {
    sendError(res, 'Invalid store');
  } else {
    const authCustomerApi = await getAuthCustomerApi(
      firestore,
      apiAuth,
      authtoken,
      authFirebase,
    );
    if (authCustomerApi !== null) {
      res.send(authCustomerApi);
    } else {
      sendError(res, 'Invalid token, unauthorized', 401);
    }
  }
});

app.use('/api/:resource([^/]+)(/:id)?(/:path)?', async (req: Request, res: Response) => {
  const { authtoken } = req.headers;
  const { resource, id, path } = req.params;
  const { apiAuth } = env();
  let url = resource;
  url += id ? `/${id}` : '';
  url += path ? `/${path}` : '';

  const endpoint = url as Endpoint;
  if (!firestore) {
    sendError(res, 'Firestore not found', 500);
  } else {
    const authCustomerApi = await getAuthCustomerApi(firestore, apiAuth, authtoken, authFirebase);
    if (authCustomerApi !== null) {
      const { data } = await callApi(
        endpoint,
        req,
        { authenticationId: authCustomerApi.customer_id, apiKey: authCustomerApi.access_token },
      );
      res.send(data);
    } else {
      sendError(res, 'Invalid token, unauthorized', 401);
    }
  }
});

// eslint-disable-next-line import/prefer-default-export
export const passport = onRequest(options, app);
