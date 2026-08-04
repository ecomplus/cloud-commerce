import type Bling from '../../bling-auth/client';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import getEnv from '@cloudcommerce/firebase/lib/env';

const firestoreColl = 'blingStatuses';

/*
Lists the "situações" of the Bling sales module, cached for 1h on Firestore.
*/
const getStatusBling = async (bling: Bling): Promise<Array<Record<string, any>> | null> => {
  const { storeId } = getEnv();
  const docRef = getFirestore().doc(`${firestoreColl}/${storeId}`);
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
