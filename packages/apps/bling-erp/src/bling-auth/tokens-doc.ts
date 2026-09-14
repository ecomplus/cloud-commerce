import type { DocumentReference } from 'firebase-admin/firestore';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

export const BLING_TOKENS_COLLECTION = 'blingTokens';

/*
Segundos descontados do `expires_in` ao gravar `expiredAt`, único para os dois
escritores (fluxo de autorização e refresh) não divergirem.
*/
export const EXPIRES_IN_GAP_SEC = 300;

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

/*
Chaveado pelo `client_id` (a identidade da credencial, como
`paypalTokens/${PAYPAL_CLIENT_ID}`), não por `storeId`, que é constante no
projeto: trocar as credenciais nas configurações passa a "invalidar" os tokens
naturalmente, em vez de reusar o refresh token antigo com credencial nova e
bloquear a integração com `invalid_grant`.
*/
export const getTokensDocRef = (clientId: string) => {
  return getFirestore()
    .doc(`${BLING_TOKENS_COLLECTION}/${clientId}`) as DocumentReference<BlingTokensDoc>;
};

export default getTokensDocRef;
