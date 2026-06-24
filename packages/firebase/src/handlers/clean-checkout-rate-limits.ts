import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger, checkoutRateLimitsCollection } from '../config';

const BATCH_SIZE = 300;
const MAX_BATCHES = 50;

export default async () => {
  const db = getFirestore();
  const now = Timestamp.now();
  let totalDeleted = 0;
  for (let batchNumber = 0; batchNumber < MAX_BATCHES; batchNumber += 1) {
    // eslint-disable-next-line no-await-in-loop
    const snapshot = await db.collection(checkoutRateLimitsCollection)
      .where('expireAt', '<=', now)
      .limit(BATCH_SIZE)
      .get();
    if (snapshot.empty) break;
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    // eslint-disable-next-line no-await-in-loop
    await batch.commit();
    totalDeleted += snapshot.size;
    if (snapshot.size < BATCH_SIZE) break;
  }
  if (totalDeleted) {
    logger.info(`Cleaned ${totalDeleted} expired checkout rate limit docs`);
  }
};
