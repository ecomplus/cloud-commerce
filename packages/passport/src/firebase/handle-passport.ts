import type { Customers } from '@cloudcommerce/types';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
// eslint-disable-next-line import/no-unresolved
import { getAuth } from 'firebase-admin/auth';
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

const checkFirebaseAuth = async (authToken?: string | undefined) => {
  const firebaseAuth = getAuth();
  if (authToken && !Array.isArray(authToken)) {
    try {
      const firebaseAuthUser = await firebaseAuth.verifyIdToken(authToken);
      return firebaseAuthUser;
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

const generateAccessToken = async (customerId: string): Promise<null | {
  customer_id: string,
  access_token: string,
  expires: string,
}> => {
  const { apiAuth } = getEnv();
  const docRef = getFirestore().doc(`customerTokens/${customerId}`);
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

const getAuthCustomerApi = async (firebaseAuthToken: string | undefined) => {
  const firebaseAuthUser = await checkFirebaseAuth(firebaseAuthToken);
  if (firebaseAuthUser?.email && firebaseAuthUser.email_verified) {
    const customer = await findCustomerByEmail(firebaseAuthUser.email);
    if (customer !== null) {
      return generateAccessToken(customer._id);
    }
    const newCustomer = {
      display_name: firebaseAuthUser.name || '',
      main_email: firebaseAuthUser.email,
      emails: [{
        address: firebaseAuthUser.email,
        verified: firebaseAuthUser.email_verified,
      }],
    } as Customers;
    const customerId = await createCustomer(newCustomer);
    if (customerId) {
      return generateAccessToken(customerId);
    }
  }
  // TODO: Find customer by phone number, generate token if found, otherwise unauthorize
  return null;
};

export {
  getAuthCustomerApi,
  findCustomerByEmail,
  generateAccessToken,
};
