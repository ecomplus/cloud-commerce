import type { AxiosInstance } from 'axios';
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import { isSandbox } from '../../utils';
import gerateAccessToken from './gerate-token';
import createAxios from './create-axios';

const { GALAXPAY_PARTNER_ID, GALAXPAY_PARTNER_HASH } = process.env;

const firestoreColl = 'galaxpayTokens';

type Option = {
  galaxpayId?: string;
  galaxpayHash?: string;
}

export default class GalaxPay {
  preparing: Promise<unknown>;
  axios: AxiosInstance | undefined;

  constructor(options: Option) {
    const {
      galaxpayId,
      galaxpayHash,
    } = options;

    const self = this;

    let documentRef;
    const hashLogin = Buffer.from(`${galaxpayId}:${galaxpayHash}`).toString('base64');

    if (firestoreColl) {
      documentRef = getFirestore()
        .doc(`${firestoreColl}/${hashLogin}`);
    }

    let galaxpayPartnerHash: string | undefined;

    if (GALAXPAY_PARTNER_ID && GALAXPAY_PARTNER_HASH) {
      galaxpayPartnerHash = Buffer.from(`${GALAXPAY_PARTNER_ID}:${GALAXPAY_PARTNER_HASH}`).toString('base64');
    }

    this.preparing = new Promise((resolve, reject) => {
      const authenticate = (token: string) => {
        self.axios = createAxios(token, isSandbox);
        resolve(self);
      };

      const handleAuth = () => {
        logger.log('>(App Galaxpay) Auth02 ');
        gerateAccessToken(hashLogin, isSandbox, galaxpayPartnerHash)
          .then((accessToken) => {
            // logger.log(`>(App Galaxpay) ${hashLogin}: ${accessToken}`);
            authenticate(accessToken as string);
            if (documentRef) {
              documentRef.set({ accessToken }).catch(logger.error);
            }
          })
          .catch(reject);
      };

      if (documentRef) {
        documentRef.get()
          .then((documentSnapshot) => {
            if (documentSnapshot.exists
              && Date.now() - documentSnapshot.updateTime.toDate().getTime()
              <= 5 * 60 * 1000 // access token expires in 5 minutes
            ) {
              authenticate(documentSnapshot.get('accessToken'));
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
