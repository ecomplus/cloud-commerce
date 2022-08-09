import type { Response } from 'firebase-functions';
import type { Customers } from '@cloudcommerce/types';
// eslint-disable-next-line import/no-unresolved
import type { Firestore, DocumentReference } from 'firebase-admin/firestore';
// eslint-disable-next-line import/no-unresolved
import { Auth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import config from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';

const firestoreColl = 'apiToken';
const { storeId } = config.get();

const readStore = async (
  apiAuth: { authenticationId: string, apiKey: string },
) => {
  const headers = {
    'X-Store-ID': `${storeId}`,
  };

  try {
    const { data } = await api.get('stores/me', {
      ...apiAuth,
      headers,
    });
    return data;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

const findCustomerByEmail = async (
  email: string | undefined,
  apiAuth: { authenticationId: string, apiKey: string },
) => {
  const headers = {
    'X-Store-ID': `${storeId}`,
  };

  try {
    const { data } = await api.get(`customers?main_email=${email}`, {
      ...apiAuth,
      headers,
    });
    if (data.result.length) {
      return data.result[0];
    }
    return null;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

const checkAuthFirebase = async (
  auth: Auth,
  authToken: string | undefined | string [],
) => {
  if (authToken && !Array.isArray(authToken)) {
    try {
      const customer = await auth.verifyIdToken(authToken);
      return customer;
    } catch (e) {
      return null;
    }
  } else {
    return null;
  }
};

const sendError = (
  res: Response,
  msg?: string,
  status = 400,
) => {
  if (msg) {
    res.status(status).json({
      status,
      error: msg,
    });
  } else {
    res.status(500).json({
      status: 500,
      error: 'Internal server error',
    });
  }
};

const handleAuthApi = async (
  documentRef: DocumentReference,
  customerId: string,
  apiAuth: { authenticationId: string, apiKey: string },
) => {
  const headers = {
    'X-Store-ID': `${storeId}`,
  };

  try {
    const { data } = await api.post(
      'authenticate',
      {
        _id: apiAuth.authenticationId,
        api_key: apiAuth.apiKey,
        customer_id: customerId,
      },
      { headers },
    );
    if (documentRef) {
      documentRef.set({ ...data, customer_id: customerId }).catch(logger.error);
    }
    return data;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

const checkAcessTokenApi = async (
  firestore:Firestore,
  customerId: string,
  apiAuth: { authenticationId: string, apiKey: string },
) => {
  const docRef = firestore.doc(`${firestoreColl}/${customerId}`);
  if (docRef) {
    // create auth in api
    const doc = await docRef.get();
    const expires = doc.data()?.expires;
    if (doc.exists && expires
      && (Date.now() <= (new Date(expires).getTime() - 10 * 60 * 1000))) {
      return doc.data();
    }
    return handleAuthApi(docRef, customerId, apiAuth);
  }
  return null;
};

const createCustomer = async (
  customer: Customers,
  apiAuth: { authenticationId: string, apiKey: string },
) => {
  const headers = {
    'X-Store-ID': `${storeId}`,
  };

  try {
    const { data } = await api.post(
      'customers',
      customer,
      {
        ...apiAuth,
        headers,
      },
    );
    return data._id;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

const getAuthCustomerApi = async (
  firestore: Firestore,
  customerId: string,
  apiAuth: { authenticationId: string, apiKey: string },
  res: Response,
) => {
  const authCustomerApi = await checkAcessTokenApi(
    firestore,
    customerId,
    apiAuth,
  );

  if (authCustomerApi) {
    authCustomerApi.customer_id = customerId;
    delete authCustomerApi.expires;
    delete authCustomerApi.my_id;
    res.send(authCustomerApi);
  } else {
    sendError(res);
  }
};

export {
  readStore,
  findCustomerByEmail,
  checkAuthFirebase,
  sendError,
  createCustomer,
  getAuthCustomerApi,
};
