import type { Request, Response } from 'firebase-functions';
import type { Customers } from '@cloudcommerce/types';
import type { Firestore, DocumentReference } from 'firebase-admin/firestore';
import { Endpoint } from '@cloudcommerce/api/src/types';
// eslint-disable-next-line import/no-unresolved
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

const handleAuthCustomerApi = async (
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
    return handleAuthCustomerApi(docRef, customerId, apiAuth);
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

const checkAuthCustomerApi = async (
  firestore: Firestore,
  customerId: string,
  apiAuth: { authenticationId: string, apiKey: string },
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
    return authCustomerApi;
  }
  logger.error(new Error('Acess token api not found'));
  return null;
};

const getAuthCustomerApi = async (
  firestore: Firestore,
  apiAuth: { authenticationId: string, apiKey: string },
  authtoken: string | string[] | undefined,
  authFirebase: Auth,
) => {
  const customerAuth = await checkAuthFirebase(authFirebase, authtoken);
  if (customerAuth !== null) {
    const customer = await findCustomerByEmail(
      customerAuth.email,
      apiAuth,
    );
    if (customer != null) {
      // check acess token and return custumer _id and acess token
      return checkAuthCustomerApi(firestore, customer._id, apiAuth);
    }
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
    const customerId = await createCustomer(profile, apiAuth);
    if (customerId) {
      return checkAuthCustomerApi(firestore, customerId, apiAuth);
    }
    return null;
  }
  return null;
};

const callApi = (
  endpoint:Endpoint,
  req: Request,
  apiAuthCustumer: { authenticationId: string, apiKey: string },
) => {
  const { method, body } = req;
  const headers = {
    'X-Store-ID': `${storeId}`,
  };

  if (method === 'GET') {
    return api.get(
      `${endpoint}`,
      {
        ...apiAuthCustumer,
        headers,
      },
    );
  } if (method === 'DELETE') {
    return api.delete(`${endpoint}`, {
      ...apiAuthCustumer,
      headers,
    });
  }
  return api[`${method}`](endpoint, body, {
    ...apiAuthCustumer,
    headers,
  });
};

export {
  readStore,
  sendError,
  getAuthCustomerApi,
  callApi,
};
