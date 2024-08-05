import type { Resource, Customers } from '@cloudcommerce/api/types';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import api from '@cloudcommerce/api';
import getEnv from '@cloudcommerce/firebase/lib/env';

export const findCustomerByEmail = async (email: string, docNumber?: string) => {
  const params: Partial<Record<keyof Customers | `${keyof Customers}~`, string>> = {
    'main_email~': `^${email}$`,
  };
  if (docNumber) {
    params.doc_number = docNumber;
  }
  const { data } = await api.get('customers', {
    params,
    fields: [
      '_id',
      'main_email',
      'login',
      'enabled',
      'display_name',
      'registry_type',
    ] as const,
  });
  if (data.result.length) {
    return data.result[0];
  }
  return null;
};

type ApiPermissions = Partial<Record<
  Resource | '*',
  ('GET' | 'PATCH')[] | ['all']
>>;

export const generateAccessToken = async (
  customerId: string,
  permissions?: ApiPermissions,
): Promise<{
  customer_id: string,
  access_token: string,
  expires: string,
}> => {
  const { apiAuth } = getEnv();
  const { data } = await api({
    endpoint: 'authenticate',
    method: 'post',
    body: {
      _id: apiAuth.authenticationId,
      api_key: apiAuth.apiKey,
      customer_id: customerId,
      permissions,
    },
  });
  return {
    access_token: data.access_token,
    expires: data.expires,
    customer_id: customerId,
  };
};

const checkFirebaseAuth = async (authToken: string) => {
  const firebaseAuth = getAuth();
  try {
    const firebaseAuthUser = await firebaseAuth.verifyIdToken(authToken);
    return firebaseAuthUser;
  } catch {
    return null;
  }
};

export const authenticateCustomer = async (firebaseAuthToken: string) => {
  const firebaseAuthUser = await checkFirebaseAuth(firebaseAuthToken);
  if (firebaseAuthUser) {
    const { name, email, email_verified: isEmailVerified } = firebaseAuthUser;
    if (email && isEmailVerified) {
      const customerMatch = await findCustomerByEmail(email);
      const customerId = customerMatch?._id;
      if (customerId) {
        if (customerMatch.login === false) {
          return null;
        }
        const docRef = getFirestore().doc(`customerTokens/${customerId}`);
        const storedToken = (await docRef.get()).data() as undefined | {
          customer_id: string,
          access_token: string,
          expires: string,
        };
        const expires = storedToken?.expires;
        if (expires && new Date(expires).getTime() - Date.now() >= 2 * 60 * 1000) {
          return storedToken;
        }
        const permissions: ApiPermissions = { '*': ['all'] };
        if (customerMatch.enabled === false) {
          permissions.orders = ['GET', 'PATCH'];
        }
        const customerToken = await generateAccessToken(customerId, permissions);
        docRef.set(customerToken).catch(logger.error);
        return customerToken;
      }
      const { data: newCustomer } = await api.post('customers', {
        display_name: name || '',
        main_email: email,
        emails: [{
          address: email,
          verified: isEmailVerified,
        }],
      });
      return generateAccessToken(newCustomer._id);
    }
    // TODO: Find customer by phone number, generate token if found, otherwise unauthorize
  }
  return null;
};
