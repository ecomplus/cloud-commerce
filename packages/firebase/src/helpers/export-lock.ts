import { randomUUID } from 'node:crypto';
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

The lock doc is the source of truth for the executions that lose it: they wait on
it, not on the ERP, until the winner either saves what it created (`complete`) or
releases the lock because nothing was created (`fail`), in which case the next one
takes the lock and creates the record itself.

Docs carry `expiresAt` for a Firestore TTL policy, they are useless after a day.
*/

const DEFAULT_POLL_INTERVAL_MS = 2000;
const LOCK_TTL_MS = 1000 * 60 * 60 * 24;

export type ExportLockOptions = {
  /*
  A lock without a finished export older than this is taken over, so a record is
  not left unexported forever when the winning execution dies between taking the
  lock and creating it (timeout, instance eviction). It must be longer than an
  execution can hold the lock (the timeout of the function taking it), otherwise
  a slow but live execution is taken over and the record is duplicated.
  A finished export older than this is taken over as well, it is how a record
  deleted on the ERP on purpose can be exported again.
  */
  staleLockMs: number,
  // How long to wait on a concurrent execution before giving up
  maxWaitMs: number,
  pollIntervalMs?: number,
};

export type ExportLock = {
  isLocked: true,
  // To call right before sending the request that creates the record
  setSending: () => void,
  // Saves what concurrent executions need to go on without creating (the ERP id)
  complete: (exported: Record<string, any>) => Promise<void>,
  /*
  Releases the lock so the next execution can create the record, unless the create
  request was sent and failed without a response (timeout, network): the record may
  have been created anyway, so the lock is kept until stale to avoid a duplicate.
  */
  fail: (err: any) => Promise<void>,
};

export type ConcurrentExport = {
  isLocked: false,
  // Saved by the concurrent execution that created the record
  exported: Record<string, any>,
};

/*
Thrown when a concurrent execution holds the lock for longer than `maxWaitMs`.
It is meant to be retried later (event redelivery), never handled as success.
*/
export class ConcurrentExportError extends Error {
  isConcurrentExport = true;

  constructor(lockPath: string) {
    super(`Exportação de ${lockPath} em andamento em outra execução`);
    this.name = 'ConcurrentExportError';
  }
}

const sleep = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export const acquireExportLock = async (
  collectionName: string,
  resourceId: string,
  {
    staleLockMs,
    maxWaitMs,
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  }: ExportLockOptions,
): Promise<ExportLock | ConcurrentExport> => {
  const firestore = getFirestore();
  const docRef = firestore.collection(collectionName).doc(resourceId);
  const lockPath = `${collectionName}/${resourceId}`;
  const lockId = randomUUID();
  /* Without Firestore the export goes on unlocked, as before the lock existed:
  a possible duplicate is better than an order that never reaches the ERP. */
  let isTracked = true;
  let isSending = false;

  const lock: ExportLock = {
    isLocked: true,
    setSending() {
      isSending = true;
    },
    async complete(exported) {
      if (!isTracked) return;
      const exportedData: Record<string, any> = {};
      Object.keys(exported).forEach((field) => {
        if (exported[field] !== undefined) exportedData[field] = exported[field];
      });
      try {
        await docRef.set({
          exported: exportedData,
          exportedAt: Timestamp.now(),
        }, { merge: true });
      } catch (err: any) {
        logger.warn(`Failed saving export lock ${lockPath}`, { err });
      }
    },
    async fail(err) {
      if (!isTracked) return;
      if (isSending && !err?.response) {
        logger.warn(`Keeping export lock ${lockPath}, record may have been created`, {
          err,
        });
        return;
      }
      try {
        await firestore.runTransaction(async (transaction) => {
          const snapshot = await transaction.get(docRef);
          // The lock may have been taken over meanwhile, it is not ours to release
          if (snapshot.get('lockId') === lockId) {
            transaction.delete(docRef);
          }
        });
      } catch (_err: any) {
        logger.warn(`Failed releasing export lock ${lockPath}`, { err: _err });
      }
    },
  };

  const startedAt = Date.now();
  let isWaitLogged = false;
  for (;;) {
    let state: 'locked' | 'takenOver' | 'busy' | { exported: Record<string, any> };
    try {
      // eslint-disable-next-line no-await-in-loop
      state = await firestore.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(docRef);
        const now = Date.now();
        const lockData = {
          lockId,
          lockedAt: Timestamp.fromMillis(now),
          expiresAt: Timestamp.fromMillis(now + LOCK_TTL_MS),
        };
        if (!snapshot.exists) {
          transaction.create(docRef, lockData);
          return 'locked';
        }
        const exported = snapshot.get('exported') as Record<string, any> | undefined;
        const lockedAt = (snapshot.get('exportedAt') || snapshot.get('lockedAt')) as
          Timestamp | undefined;
        if (!lockedAt || now - lockedAt.toMillis() >= staleLockMs) {
          transaction.set(docRef, lockData);
          return 'takenOver';
        }
        return exported ? { exported } : 'busy';
      });
    } catch (err: any) {
      logger.error(err);
      logger.warn(`Exporting ${lockPath} unlocked, export lock is unavailable`);
      isTracked = false;
      return lock;
    }
    if (state === 'locked') {
      return lock;
    }
    if (state === 'takenOver') {
      logger.warn(`Took over stale export lock ${lockPath}`);
      return lock;
    }
    if (state !== 'busy') {
      return { isLocked: false, exported: state.exported };
    }
    if (Date.now() - startedAt + pollIntervalMs > maxWaitMs) {
      throw new ConcurrentExportError(lockPath);
    }
    if (!isWaitLogged) {
      logger.info(`Waiting concurrent export ${lockPath}`);
      isWaitLogged = true;
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(pollIntervalMs);
  }
};
