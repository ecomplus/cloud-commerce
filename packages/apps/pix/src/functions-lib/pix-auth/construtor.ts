import type { AxiosInstance } from 'axios';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import createAxios from './create-axios';
import oauth from './oauth';

type Option = {
  clientId?: string;
  clientSecret?: string;
  oauthEndpoint?: any;
  pfx?: any;
  tokenData?: any;
  baseURL?: string
}

const firestoreColl = 'pix_tokens';

export default class Pix {
  preparing: Promise<unknown>;
  axios: AxiosInstance | undefined;

  constructor(options: Option) {
    const {
      clientId,
      clientSecret,
      baseURL,
      pfx,
      tokenData,
    } = options;

    const self = this;

    let documentRef;
    if (firestoreColl) {
      documentRef = getFirestore()
        .doc(`${firestoreColl}/${clientId}:${clientSecret}`);
    }

    this.preparing = new Promise((resolve, reject) => {
      const authenticate = (token: any) => {
        self.axios = createAxios({ pfx, tokenData: token, baseURL });
        resolve(self);
      };

      const fetchOauth = () => {
        logger.log('>(App: Pix) OAuth');
        oauth(options)
          // eslint-disable-next-line no-shadow
          .then((tokenData) => {
            logger.log(`>(App: Pix) Token ${JSON.stringify(tokenData)}`);
            authenticate(tokenData);
            if (documentRef) {
              documentRef.set({ tokenData }).catch(logger.error);
            }
          })
          .catch(reject);
      };

      if (tokenData) {
        authenticate(tokenData);
      } else if (documentRef) {
        documentRef.get()
          .then((documentSnapshot) => {
            const token = documentSnapshot.get('tokenData');
            const expiresIn = (tokenData && tokenData.expires_in) || 3600;
            const deadline = Date.now() + 10000 - documentSnapshot.updateTime.toDate().getTime();
            if (
              documentSnapshot.exists
              && deadline <= expiresIn * 1000
            ) {
              authenticate(token);
            } else {
              fetchOauth();
            }
          })
          .catch((err: any) => {
            logger.error(err);
            fetchOauth();
          });
      } else {
        fetchOauth();
      }
    });
  }
}
