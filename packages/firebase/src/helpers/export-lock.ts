import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from '../config';

/*
Locks the creation of an external record (such as an ERP order) to one execution.

Resource events are published per modified fields, so the same order usually gets
two events within seconds (checkout, then payment). Each event runs on its own
function execution, and nothing stops two of them from running at the same time:
`maxInstances` is best-effort and is exceeded on concurrent cold starts. Checking
whether the record already exists on the ERP is not enough to dedupe, because
creating it takes seconds and both executions read "not found" before either writes.
*/

const DEFAULT_STALE_LOCK_MS = 1000 * 60 * 5;

const ALREADY_EXISTS = 6;

export const tryLockExport = async (
  collectionName: string,
  resourceId: string,
  staleLockMs = DEFAULT_STALE_LOCK_MS,
): Promise<boolean> => {
  const docRef = getFirestore().collection(collectionName).doc(resourceId);
  try {
    await docRef.create({ lockedAt: Timestamp.now() });
    return true;
  } catch (err: any) {
    if (err?.code !== ALREADY_EXISTS) throw err;
  }
  /* A lock is also left behind when the winning execution dies before releasing
  it (timeout, instance eviction). Taking it over after `staleLockMs` keeps the
  resource exportable, at the cost of a duplicate if the first attempt is somehow
  still running - hence a window much longer than any export takes. */
  try {
    const takenOver = await getFirestore().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(docRef);
      const lockedAt = snapshot.get('lockedAt') as Timestamp | undefined;
      if (lockedAt && Date.now() - lockedAt.toMillis() < staleLockMs) {
        return false;
      }
      transaction.set(docRef, { lockedAt: Timestamp.now() });
      return true;
    });
    if (takenOver) {
      logger.warn(`Took over stale export lock ${collectionName}/${resourceId}`);
    }
    return takenOver;
  } catch (err: any) {
    logger.warn(`Failed checking export lock ${collectionName}/${resourceId}`, { err });
    return false;
  }
};

export const unlockExport = async (collectionName: string, resourceId: string) => {
  try {
    await getFirestore().collection(collectionName).doc(resourceId).delete();
  } catch (err: any) {
    logger.warn(`Failed releasing export lock ${collectionName}/${resourceId}`, { err });
  }
};
