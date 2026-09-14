import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '@cloudcommerce/firebase/lib/config';
import getTokensDocRef from './tokens-doc';

/*
Checks whether Bling API can be reached with the stored tokens,
skipping requests while blocked by an invalid refresh token
or by the daily rate limit. A mesma janela de 12h do `createAccess`, que é
quem limpa a flag: janela maior aqui deixaria a integração parada esperando
o cron mesmo depois da política já ter liberado.
*/
export const RATE_LIMIT_WINDOW_MS = 12 * 60 * 60 * 1000;

const checkEnableApi = async (clientId: string) => {
  const docSnapshot = await getTokensDocRef(clientId).get();
  if (!docSnapshot.exists) {
    return false;
  }
  const { isBloqued, updatedAt, isRateLimit } = docSnapshot.data() as Record<string, any>;
  const now = Timestamp.now();
  const timeLimitBloqued = Timestamp.fromMillis(
    (updatedAt?.toMillis() || 0) + RATE_LIMIT_WINDOW_MS,
  );
  if (isBloqued) {
    logger.warn('Bling refreshToken is invalid need to update');
    return false;
  }
  if (isRateLimit && now.toMillis() < timeLimitBloqued.toMillis()) {
    return false;
  }
  return true;
};

export default checkEnableApi;
