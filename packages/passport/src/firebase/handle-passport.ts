import type { Response } from 'firebase-functions';
import type { Customers } from '@cloudcommerce/types';
import type { Firestore } from 'firebase-admin/firestore';
// eslint-disable-next-line import/no-unresolved
import { Auth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import api from '@cloudcommerce/api';
import getEnv from '@cloudcommerce/firebase/lib/env';

const findCustomerByEmail = async (email: string | undefined) => {
  try {
    const { data } = await api.get(`customers?main_email=${email}`);
    if (data.result.length) {
      return data.result[0];
    }
    return null;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

const checkFirebaseAuth = async (
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

const createCustomer = async (customer: Customers) => {
  try {
    const { data } = await api.post('customers', customer);
    return data._id;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

const generateAccessToken = async (
  firestore: Firestore,
  customerId: string,
): Promise<null | {
  customer_id: string,
  access_token: string,
  expires: string,
}> => {
  const { apiAuth } = getEnv();
  const docRef = firestore.doc(`customerTokens/${customerId}`);
  const doc = await docRef.get();
  const expires: string | undefined = doc.data()?.expires;
  if (expires && new Date(expires).getTime() - Date.now() >= 2 * 60 * 1000) {
    return doc.data() as { customer_id: string, access_token: string, expires: string };
  }
  try {
    const { data } = await api({
      endpoint: 'authenticate',
      method: 'post',
      body: {
        _id: apiAuth.authenticationId,
        api_key: apiAuth.apiKey,
        customer_id: customerId,
      },
    });
    const accessToken = {
      access_token: data.access_token,
      expires: data.expires,
      customer_id: customerId,
    };
    docRef.set(accessToken).catch(logger.error);
    return accessToken;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

const getAuthCustomerApi = async (
  firestore: Firestore,
  authtoken: string | string[] | undefined,
  authFirebase: Auth,
) => {
  const customerFirebaseAuth = await checkFirebaseAuth(authFirebase, authtoken);
  if (customerFirebaseAuth?.email && customerFirebaseAuth.email_verified) {
    const customer = await findCustomerByEmail(customerFirebaseAuth.email);
    if (customer !== null) {
      return generateAccessToken(firestore, customer._id);
    }
    const newCustomer = {
      display_name: customerFirebaseAuth.name || '',
      main_email: customerFirebaseAuth.email,
      emails: [{
        address: customerFirebaseAuth.email,
        verified: customerFirebaseAuth.email_verified,
      }],
    } as Customers;
    const customerId = await createCustomer(newCustomer);
    if (customerId) {
      return generateAccessToken(firestore, customerId);
    }
  }
  // TODO: Find customer by phone number, generate token if found, otherwise unauthorize
  return null;
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

export {
  sendError,
  getAuthCustomerApi,
  findCustomerByEmail,
  generateAccessToken,
};
