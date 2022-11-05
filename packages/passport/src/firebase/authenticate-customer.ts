// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
// eslint-disable-next-line import/no-unresolved
import { getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import api from '@cloudcommerce/api';
import getEnv from '@cloudcommerce/firebase/lib/env';

const findCustomerByEmail = async (email: string | undefined, isOnlyId = true) => {
  let params = `main_email=${email}`;
  if (isOnlyId) {
    params += '&fields=_id';
  }
  const { data } = await api.get(`customers?${params}`);
  if (data.result.length) {
    return data.result[0];
  }
  return null;
};

const generateAccessToken = async (customerId: string): Promise<null | {
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
  } catch (err) {
    return null;
  }
};

const authenticateCustomer = async (firebaseAuthToken: string) => {
  const firebaseAuthUser = await checkFirebaseAuth(firebaseAuthToken);
  if (firebaseAuthUser) {
    const { name, email, email_verified: isEmailVerified } = firebaseAuthUser;
    if (email && isEmailVerified) {
      const customerId = (await findCustomerByEmail(email))?._id;
      if (customerId) {
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
        const customerToken = await generateAccessToken(customerId);
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

export default authenticateCustomer;

export {
  findCustomerByEmail,
  generateAccessToken,
};
