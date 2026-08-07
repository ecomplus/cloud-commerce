import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '@cloudcommerce/firebase/lib/config';
import getTokensDocRef from './tokens-doc';

/*
Checks whether Bling API can be reached with the stored tokens,
skipping requests while blocked by an invalid refresh token
or by the daily rate limit (kept for 24h).
*/
const checkEnableApi = async () => {
  const docSnapshot = await getTokensDocRef().get();
  if (!docSnapshot.exists) {
    return false;
  }
  const { isBloqued, updatedAt, isRateLimit } = docSnapshot.data() as Record<string, any>;
  const now = Timestamp.now();
  const timeLimitBloqued = Timestamp.fromMillis(
    (updatedAt?.toMillis() || 0) + (24 * 60 * 60 * 1000),
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
