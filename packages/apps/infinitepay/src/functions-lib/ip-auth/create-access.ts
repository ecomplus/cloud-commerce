import type { AxiosInstance } from 'axios';
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import auth from './oauth';
import Axios from './create-axios';

const firestoreColl = 'infinitepay_tokens';

type Option = {
  clientId: string;
  clientSecret: string;
  typeScope: string,
  isSandbox?: boolean
}

export default class IPAxios {
  preparing: Promise<unknown>;
  axios: AxiosInstance | undefined;
  cardTokenization: string | undefined;

  constructor(options: Option) {
    const {
      clientId,
      clientSecret,
      typeScope,
      isSandbox,
    } = options;

    const self = this;

    let documentRef;
    if (firestoreColl) {
      documentRef = getFirestore()
        .doc(`${firestoreColl}/${typeScope}`);
    }

    this.preparing = new Promise((resolve, reject) => {
      // typeScope ===  card, if scope card_tokenization
      // typeScope === transaction, if scope for transaction

      let scope = 'transactions';
      if (typeScope === 'card') {
        scope = 'card_tokenization';
      }

      const authenticate = (accessToken: string) => {
        if (scope === 'transactions') {
          self.axios = Axios(accessToken, isSandbox);
        } else {
          self.cardTokenization = accessToken;
        }
        resolve(self);
      };

      const handleAuth = () => {
        logger.log('>(App: InfinitePay) Auth ');

        auth(clientId, clientSecret, scope, isSandbox)
          .then((resp: any) => {
            authenticate(resp.access_token);
            if (documentRef) {
              documentRef.set({ ...resp, isSandbox }).catch(logger.error);
            }
          })
          .catch(reject);
      };

      if (documentRef) {
        documentRef.get()
          .then((documentSnapshot) => {
            const data = documentSnapshot.data() || null;
            if (documentSnapshot.exists && data && data.expires_in
              && new Date(data.expires_in).getTime() > Date.now()) {
              authenticate(data.access_token);
            } else {
              handleAuth();
            }
          })
          .catch(logger.error);
      } else {
        handleAuth();
      }
    });
  }
}
