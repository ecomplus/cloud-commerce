import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '@cloudcommerce/firebase/lib/config';
import createAxios from './create-axios';
import blingAuth from './create-auth';
import getTokensDocRef from './tokens-doc';

/*
Returns an Axios instance authenticated with a valid Bling access token,
refreshing it with the stored `refresh_token` when near expiration.
*/
const createAccess = async (
  clientId: string,
  clientSecret: string,
  tokenExpirationGap = 9000,
  isRateLimit = false,
) => {
  const docRef = getTokensDocRef();
  const docSnapshot = await docRef.get();
  if (!docSnapshot.exists) {
    const err: any = new Error('No Bling token document');
    err.code = 'NO_BLING_TOKEN';
    throw err;
  }
  const {
    access_token: docAccessToken,
    refresh_token: refreshToken,
    expiredAt,
    isBloqued,
    updatedAt,
    isRateLimit: isRateLimitDoc,
  } = docSnapshot.data() as Record<string, any>;

  const now = Timestamp.now();
  const timeLimitBloqued = Timestamp.fromMillis(
    (updatedAt?.toMillis() || now.toMillis()) + (12 * 60 * 60 * 1000),
  );

  if (isBloqued) {
    throw new Error('Bling refreshToken is invalid need to update');
  }

  if (isRateLimit) {
    // Flag daily rate limit
    await docRef.set({
      isRateLimit: true,
      updatedAt: now,
      countErr: 0,
    }, { merge: true }).catch(logger.error);
    throw new Error('Bling daily rate limit reached, please try again later');
  }
  if (isRateLimitDoc) {
    if (now.toMillis() < timeLimitBloqued.toMillis()) {
      throw new Error('Bling daily rate limit reached, please try again later');
    }
    // Disable daily rate limit
    await docRef.set({
      isRateLimit: false,
      updatedAt: now,
      countErr: 0,
    }, { merge: true }).catch(logger.error);
  }

  let accessToken: string | undefined;
  if (expiredAt && now.toMillis() + tokenExpirationGap < expiredAt.toMillis()) {
    accessToken = docAccessToken;
  } else {
    try {
      const data = await blingAuth(clientId, clientSecret, null, refreshToken);
      await docRef.set({
        ...data,
        updatedAt: now,
        expiredAt: Timestamp.fromMillis(now.toMillis() + ((data.expires_in - 300) * 1000)),
        countErr: 0,
      }, { merge: true });
      accessToken = data.access_token;
    } catch (err: any) {
      const isInvalidGrant = err.response?.data?.error?.type === 'invalid_grant';
      logger.warn(`Cant refresh Bling OAuth token ${JSON.stringify({
        url: err.config?.url,
        response: err.response?.data,
        status: err.response?.status,
      })}`);
      if (isInvalidGrant) {
        await docRef.set({
          isBloqued: true,
          updatedAt: now,
        }, { merge: true }).catch(logger.error);
      } else {
        const doc = await docRef.get();
        const countErr = (doc.data()?.countErr || 0) + 1;
        if (countErr > 3) {
          await docRef.set({
            isBloqued: true,
            updatedAt: now,
          }, { merge: true }).catch(logger.error);
        } else {
          await docRef.set({ countErr }, { merge: true }).catch(logger.error);
        }
      }
      throw err;
    }
  }

  return createAxios(accessToken);
};

export default createAccess;
