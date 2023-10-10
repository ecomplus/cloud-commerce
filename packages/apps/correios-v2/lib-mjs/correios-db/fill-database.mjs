import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import calculateV2 from '../calculate-v2.mjs';
import getDocId from './get-id-doc.mjs';

const fillDb = async (
  {
    pkg,
    declaredValue,
    zipCode,
    appData,
  },
  context,
) => {
  const cepOrigem = appData.zip.replace(/\D/g, '');

  const correiosParams = {
    cepOrigem,
    cepDestino: zipCode,
    psObjeto: pkg.weight,
    comprimento: pkg.dimensions.length,
    altura: pkg.dimensions.height,
    largura: pkg.dimensions.width,
    declaredValue,
  };
  const docId = getDocId(correiosParams);
  const docSnapshot = await getFirestore().doc(docId).get();
  if (docSnapshot.exists) {
    const { t } = docSnapshot.data();
    if (t && t.toMillis() > Date.now() - 1000 * 60 * 60 * 24 * 3) {
      logger.warn(`[Fill CorreiosV2] ${context.eventId} Skip probably dup call (${docId})`);
      return;
    }
  }

  const { data } = await calculateV2({ correiosParams });
  await getFirestore().doc(docId)
    .set({
      data,
      t: Timestamp.fromDate(new Date()),
    });
  logger.warn(`[Fill CorreiosV2] End Event ${context.eventId}`);
};

export default fillDb;