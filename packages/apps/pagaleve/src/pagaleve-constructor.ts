import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';

const createAxios = (token?: string | null, isSandbox = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Idempotency-Key': `${Date.now() + Math.random()}`,
    Authorization: token,
  };
  const baseURL = isSandbox
    ? 'https://sandbox-api.pagaleve.io'
    : 'https://api.pagaleve.com.br';
  return axios.create({
    baseURL,
    headers,
    validateStatus(status) {
      return status >= 200 && status <= 301;
    },
  });
};

const createToken = (username: string, password: string, isSandbox = false) => {
  return new Promise((resolve, reject) => {
    //  https://api-docs.addi-staging-br.com/#/Authentication/createAuthToken
    const pagaleveAxios = createAxios(null, isSandbox);
    const request = (isRetry = false) => {
      pagaleveAxios.post('/v1/authentication', { username, password })
        .then(({ data }) => resolve(data))
        .catch((err) => {
          if (!isRetry && err.response && err.response.status >= 429) {
            setTimeout(() => request(true), 7000);
          }
          reject(err);
        });
    };
    request();
  });
};

const Pagaleve = function newPagaleve(
  this: { preparing: Promise<void>, axios: AxiosInstance },
  username: string,
  password: string,
  isSandbox = false,
) {
  const self = this;
  const documentRef = getFirestore().doc('pagaleve/token');
  this.preparing = new Promise((resolve, reject) => {
    const authenticate = (token: string) => {
      self.axios = createAxios(token, isSandbox);
      resolve();
    };
    const handleAuth = () => {
      createToken(username, password, isSandbox)
        .then((data: any) => {
          authenticate(data.token);
          if (documentRef) {
            documentRef.set({
              ...data,
              isSandbox,
              updatedAt: Timestamp.now(),
            }).catch(logger.error);
          }
        })
        .catch(reject);
    };
    documentRef.get()
      .then((documentSnapshot) => {
        const data = documentSnapshot.data();
        if (data) {
          const updatedAt = (data.updatedAt as Timestamp).toMillis();
          if (updatedAt && Date.now() - updatedAt <= 50 * 60 * 1000) {
            authenticate(data!.token);
            return;
          }
        }
        handleAuth();
      })
      .catch(logger.error);
  });
};

export default Pagaleve;
