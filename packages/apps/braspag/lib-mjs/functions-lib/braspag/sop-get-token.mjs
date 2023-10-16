import { post } from 'axios';
import { getFirestore } from 'firebase-admin';
import logger from 'firebase-functions/logger';
import OAuth2AdminBraspag from './admin/get-auth.mjs';

const firestoreColl = 'braspagTokenSop';

const auth = async (
  clientId,
  clientSecret,
  merchantId,
  isSandbox,
) => new Promise((resolve, reject) => {
  const oAuth2AdminBraspag = new OAuth2AdminBraspag(
    clientId,
    clientSecret,
    isSandbox,
  );

  const request = async (isRetry) => {
    oAuth2AdminBraspag.preparing
      .then(() => {
        const { accessToken } = oAuth2AdminBraspag;
        const urlAuthSOP = `https://transaction${isSandbox ? 'sandbox' : ''}.pagador.com.br/post/api/public/v2/accesstoken`;
        const headers = {
          MerchantId: merchantId,
          Authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        };
        return post(urlAuthSOP, {}, { headers });
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

export default class {
  constructor(clientId, clientSecret, merchantId, storeId, isSandbox = false) {
    const self = this;

    let documentRef;
    // const hashLogin = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    if (firestoreColl) {
      documentRef = getFirestore()
        .doc(`${firestoreColl}/${storeId}`);
    }

    this.preparing = new Promise((resolve, reject) => {
      const authenticate = (accessToken) => {
        self.accessToken = accessToken;
        resolve(self);
      };

      const handleAuth = (sopIsSandbox) => {
        logger.log(`[Braspag] SOP ${sopIsSandbox ? 'SandBox' : ''}`);
        auth(clientId, clientSecret, merchantId, sopIsSandbox)
          .then((data) => {
            logger.log('[Braspag] SOP Token Update');
            authenticate(data.accessToken);
            if (documentRef) {
              documentRef.set({ ...data, updated_at: new Date().toISOString() })
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
              authenticate(documentSnapshot.get('accessToken'), isSandbox);
            } else {
              handleAuth(isSandbox);
            }
          })
          .catch(logger.error);
      } else {
        handleAuth(isSandbox);
      }
    });
  }
}
