import type Bling from '../../bling-auth/client';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const firestoreColl = 'blingStatuses';

/*
Lists the "situações" of the Bling sales module, cached for 1h on Firestore.
Chaveado pelo `client_id` como o `blingTokens`: as situações vêm da conta
Bling, que é identificada pela credencial.
*/
const getStatusBling = async (bling: Bling): Promise<Array<Record<string, any>> | null> => {
  const docRef = getFirestore().doc(`${firestoreColl}/${bling.clientId}`);
  const docSnapshot = await docRef.get();
  const now = Timestamp.now();
  if (docSnapshot.exists) {
    const { situacoes, updatedAt } = docSnapshot.data() as Record<string, any>;
    if (updatedAt && now.toMillis() - updatedAt.toMillis() < 1000 * 60 * 60) {
      return situacoes;
    }
  }
  const { data: { data: modules } } = await bling.get('/situacoes/modulos');
  const salesModule = modules?.find(({ nome }: Record<string, any>) => {
    return nome?.toLowerCase() === 'vendas';
  });
  if (!salesModule) {
    return null;
  }
  const { data: { data: situacoes } } = await bling.get(`/situacoes/modulos/${salesModule.id}`);
  await docRef.set({ situacoes, updatedAt: now });
  return situacoes;
};

export default getStatusBling;
