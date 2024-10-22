import { logger } from '@cloudcommerce/firebase/lib/config';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';
import OAuth2AdminBraspag from '../admin/get-auth.mjs';

const auth = async (isSandbox) => new Promise((resolve, reject) => {
  const oAuth2AdminBraspag = new OAuth2AdminBraspag(isSandbox);

  const request = async (isRetry) => {
    oAuth2AdminBraspag.preparing
      .then(() => {
        const { accessToken } = oAuth2AdminBraspag;
        const urlAuthSOP = `https://transaction${isSandbox ? 'sandbox' : ''}`
          + '.pagador.com.br/post/api/public/v2/accesstoken';
        const headers = {
          MerchantId: process.env.BRASPAG_MERCHANT_ID,
          Authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        };
        return axios.post(urlAuthSOP, {}, { headers });
      })
      .then(({ data }) => {
        let expire = new Date();
        if (data.ExpiresIn) {
          expire = new Date(`${data.ExpiresIn.replace('T', ' ')} UTC-3`);
        }
        resolve({
          accessToken: data.AccessToken,
          expiresIn: expire.getTime(),
        });
      })
      .catch((err) => {
        if (!isRetry && err.response && err.response.status >= 429) {
          setTimeout(() => request(true), 7000);
        }
        reject(err);
      });
  };
  request();
});

export default function getAccessToken(isSandbox = false) {
  const { BRASPAG_CLIENT_ID: clientId } = process.env;
  const self = this;
  const documentRef = getFirestore().doc(`braspagAdmin/sop_${clientId}`);

  this.preparing = new Promise((resolve, reject) => {
    const authenticate = (accessToken) => {
      self.accessToken = accessToken;
      resolve(self);
    };

    const handleAuth = () => {
      logger.info(`> Braspag SOP ${clientId} ${isSandbox ? 'SandBox' : ''}`);
      auth(isSandbox)
        .then((data) => {
          logger.info('> Braspag SOP Token Update');
          authenticate(data.accessToken);
          const expiresInToString = new Date(data.expiresIn).toISOString();
          if (documentRef) {
            documentRef.set({
              accessToken: data.accessToken,
              expiresIn: Date.now() + (2 * 60 * 1000),
              // ...data,
              expiresInToString,
              updated_at: new Date().toISOString(),
              isSandbox,
            })
              .catch(logger.error);
          }
        })
        .catch(reject);
    };

    if (documentRef) {
      documentRef.get()
        .then((documentSnapshot) => {
          if (documentSnapshot.exists
            && Date.now() < documentSnapshot.get('expiresIn')
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
