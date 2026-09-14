import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { logger } from '@cloudcommerce/firebase/lib/config';
import createAxios from './create-axios';
import blingAuth from './create-auth';
import getTokensDocRef, { EXPIRES_IN_GAP_SEC } from './tokens-doc';
import decideRefreshFailure from './decide-refresh-failure';
import { RATE_LIMIT_WINDOW_MS } from './check-enable-api';

/*
Erros de estado próprios (sem `.response` do axios) são normalizados com a
forma que o `after-bling-queue` sabe classificar, como o app Tiny faz no
`post-tiny-erp`: 429 mantém o item na fila para retry via redelivery,
`isConfigError` registra a mensagem sem descartar como erro inesperado.
*/
const newRateLimitError = () => {
  const err: any = new Error('Bling daily rate limit reached, please try again later');
  err.response = { status: 429 };
  return err;
};

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
  const docRef = getTokensDocRef(clientId);
  const docSnapshot = await docRef.get();
  if (!docSnapshot.exists) {
    const err: any = new Error('No Bling token document, authorize the app on admin panel');
    err.code = 'NO_BLING_TOKEN';
    err.isConfigError = true;
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
    (updatedAt?.toMillis() || now.toMillis()) + RATE_LIMIT_WINDOW_MS,
  );

  if (isBloqued) {
    const err: any = new Error('Bling refresh token is invalid, re-authorize the app');
    err.isConfigError = true;
    throw err;
  }

  if (isRateLimit) {
    // Flag daily rate limit
    await docRef.set({
      isRateLimit: true,
      updatedAt: now,
      countErr: 0,
    }, { merge: true }).catch(logger.error);
    throw newRateLimitError();
  }
  if (isRateLimitDoc) {
    if (now.toMillis() < timeLimitBloqued.toMillis()) {
      throw newRateLimitError();
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
        expiredAt: Timestamp
          .fromMillis(now.toMillis() + ((data.expires_in - EXPIRES_IN_GAP_SEC) * 1000)),
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
      // Relê o doc: um refresh concorrente (cron/callback) pode ter renovado o
      // token com sucesso enquanto o nosso `refresh_token` já era o antigo. O
      // Bling rotaciona o refresh_token a cada uso, então o perdedor da corrida
      // recebe invalid_grant — nesse caso reusamos o token novo, sem bloquear.
      const freshDoc = await docRef.get()
        .then((snap) => snap.data())
        .catch(() => undefined);
      const decision = decideRefreshFailure({
        isInvalidGrant,
        initialUpdatedAtMs: updatedAt?.toMillis() || 0,
        nowMs: now.toMillis(),
        tokenExpirationGap,
        current: {
          updatedAtMs: freshDoc?.updatedAt?.toMillis() || 0,
          accessToken: freshDoc?.access_token,
          expiredAtMs: freshDoc?.expiredAt?.toMillis(),
          isBloqued: freshDoc?.isBloqued,
          countErr: freshDoc?.countErr,
        },
      });
      if (decision.action === 'reuse') {
        logger.warn('Bling token was refreshed concurrently, reusing the fresh access token');
        return createAxios(decision.accessToken);
      }
      if (decision.action === 'block') {
        await docRef.set({
          isBloqued: true,
          updatedAt: now,
        }, { merge: true }).catch(logger.error);
      } else {
        await docRef.set({ countErr: FieldValue.increment(1) }, { merge: true }).catch(logger.error);
      }
      throw err;
    }
  }

  return createAxios(accessToken);
};

export default createAccess;
