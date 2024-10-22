import { logger } from '@cloudcommerce/firebase/lib/config';
import { getFirestore } from 'firebase-admin/firestore';
import auth from './create-auth.mjs';

export default function getAuth(isSandbox = false) {
  const {
    BRASPAG_CLIENT_ID: clientId,
    BRASPAG_CLIENT_SECRET: clientSecret,
  } = process.env;
  const self = this;
  const hashLogin = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const documentRef = getFirestore().doc(`braspagAdmin/${hashLogin}`);

  this.preparing = new Promise((resolve, reject) => {
    const authenticate = (accessToken) => {
      self.accessToken = accessToken;
      resolve(self);
    };

    const handleAuth = () => {
      logger.info(`> Admin Braspag Auth ${clientId} ${isSandbox ? 'SandBox' : ''}`);
      auth(hashLogin, isSandbox)
        .then((data) => {
          logger.info(`> Admin Braspag ${JSON.stringify(data)}`);
          authenticate(data.access_token);
          const expiresIn = Date.now() + (data.expires_in * 1000);
          if (documentRef) {
            documentRef.set({
              accessToken: data.access_token,
              expiresIn,
              expiresInToString: new Date(expiresIn).toISOString(),
              updated_at: new Date().toISOString(),
              isSandbox,
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
