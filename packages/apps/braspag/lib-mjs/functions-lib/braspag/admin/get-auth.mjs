import { getFirestore } from 'firebase-admin';
import logger from 'firebase-functions/logger';
import auth from './create-auth.mjs';

const firestoreColl = 'braspagAdmin';

export default class {
  constructor(clientId, clientSecret, isSandbox = false) {
    const self = this;

    let documentRef;
    const hashLogin = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    if (firestoreColl) {
      documentRef = getFirestore()
        .doc(`${firestoreColl}/${hashLogin}`);
    }

    this.preparing = new Promise((resolve, reject) => {
      const authenticate = (accessToken) => {
        self.accessToken = accessToken;
        resolve(self);
      };

      const handleAuth = (authIsSandbox) => {
        logger.log(`[Braspag] Admin Auth ${authIsSandbox ? 'SandBox' : ''}`);
        auth(hashLogin, authIsSandbox)
          .then((data) => {
            logger.log(`[Braspag] Admin ${JSON.stringify(data)}`);
            authenticate(data.access_token);
            if (documentRef) {
              documentRef.set({
                accessToken: data.access_token,
                expiresIn: Date.now() + data.expires_in,
              }).catch(logger.error);
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
