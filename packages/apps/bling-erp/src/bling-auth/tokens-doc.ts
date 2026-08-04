import type { DocumentReference } from 'firebase-admin/firestore';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import getEnv from '@cloudcommerce/firebase/lib/env';

export const BLING_TOKENS_COLLECTION = 'blingTokens';

export type BlingTokensDoc = {
  access_token?: string,
  refresh_token?: string,
  expiredAt?: Timestamp,
  createdAt?: Timestamp,
  updatedAt?: Timestamp,
  isBloqued?: boolean,
  isRateLimit?: boolean,
  countErr?: number,
};

export const getTokensDocRef = () => {
  const { storeId } = getEnv();
  return getFirestore()
    .doc(`${BLING_TOKENS_COLLECTION}/${storeId}`) as DocumentReference<BlingTokensDoc>;
};

export default getTokensDocRef;
