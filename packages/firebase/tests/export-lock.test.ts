import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
} from 'vitest';
import { Timestamp } from 'firebase-admin/firestore';
import {
  acquireExportLock,
  ConcurrentExportError,
  type ExportLock,
} from '../src/helpers/export-lock';

/*
In-memory Firestore with the subset used by the lock. Transactions run one at a
time, like the pessimistic locking of the server SDK, and their writes are only
applied when the callback resolves.
*/
const { db } = vi.hoisted(() => {
  const docs = new Map<string, Record<string, any>>();
  const state = { isDown: false };
  let queue: Promise<any> = Promise.resolve();
  const checkUp = () => {
    if (state.isDown) throw new Error('14 UNAVAILABLE');
  };
  const docRef = (path: string) => ({
    path,
    async set(data: Record<string, any>, opts?: { merge?: boolean }) {
      checkUp();
      docs.set(path, opts?.merge ? { ...docs.get(path), ...data } : { ...data });
    },
  });
  const firestore = {
    collection: (name: string) => ({ doc: (id: string) => docRef(`${name}/${id}`) }),
    runTransaction(fn: (transaction: any) => Promise<any>) {
      const run = queue.then(async () => {
        checkUp();
        const writes: Array<() => void> = [];
        const result = await fn({
          async get({ path }: { path: string }) {
            const data = docs.get(path);
            return { exists: Boolean(data), get: (field: string) => data?.[field] };
          },
          create({ path }: { path: string }, data: Record<string, any>) {
            writes.push(() => {
              if (docs.has(path)) throw new Error('6 ALREADY_EXISTS');
              docs.set(path, { ...data });
            });
          },
          set({ path }: { path: string }, data: Record<string, any>) {
            writes.push(() => docs.set(path, { ...data }));
          },
          delete({ path }: { path: string }) {
            writes.push(() => docs.delete(path));
          },
        });
        writes.forEach((write) => write());
        return result;
      });
      queue = run.catch(() => null);
      return run;
    },
  };
  return { db: { docs, state, firestore } };
});

vi.mock('firebase-admin/firestore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('firebase-admin/firestore')>()),
  getFirestore: () => db.firestore,
}));
vi.mock('../src/config', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const coll = 'testExportLocks';
const docPath = `${coll}/order1`;
const opts = { staleLockMs: 60000, maxWaitMs: 400, pollIntervalMs: 10 };
const acquire = (options: Partial<typeof opts> = {}) => {
  return acquireExportLock(coll, 'order1', { ...opts, ...options });
};
const minutesAgo = (minutes: number) => Timestamp.fromMillis(Date.now() - minutes * 60000);
const sleep = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const acquireLocked = async (options?: Partial<typeof opts>) => {
  const lock = await acquire(options);
  if (!lock.isLocked) throw new Error('Expected to take the lock');
  return lock as ExportLock;
};

describe('Export lock', () => {
  beforeEach(() => {
    db.docs.clear();
    db.state.isDown = false;
  });

  test('takes a free lock, with expiresAt for the TTL policy', async () => {
    const lock = await acquire();
    expect(lock.isLocked).toBe(true);
    const doc = db.docs.get(docPath);
    expect(doc?.lockedAt).toBeInstanceOf(Timestamp);
    expect(doc?.expiresAt.toMillis()).toBeGreaterThan(Date.now() + 60 * 60000);
  });

  test('locks per resource', async () => {
    await acquireLocked();
    const other = await acquireExportLock(coll, 'order2', opts);
    expect(other.isLocked).toBe(true);
  });

  test('concurrent execution waits and gets what the winner exported', async () => {
    const first = acquire();
    const second = acquire();
    const winner = await first;
    if (!winner.isLocked) throw new Error('First execution should win');
    await sleep(30);
    await winner.complete({ id: 123, numero: undefined });
    expect(await second).toEqual({ isLocked: false, exported: { id: 123 } });
  });

  test('concurrent execution takes the lock when the winner fails before sending', async () => {
    const winner = await acquireLocked();
    const second = acquire();
    await sleep(30);
    await winner.fail(new Error('Bling Customer not found'));
    expect((await second).isLocked).toBe(true);
  });

  test('released when the ERP answered the create request with an error', async () => {
    const winner = await acquireLocked();
    winner.setSending();
    await winner.fail(Object.assign(new Error('Tiny error 6'), { response: { status: 503 } }));
    expect(db.docs.has(docPath)).toBe(false);
    expect((await acquire()).isLocked).toBe(true);
  });

  test('kept when the create request failed with no response', async () => {
    const winner = await acquireLocked();
    winner.setSending();
    await winner.fail(Object.assign(new Error('timeout of 10000ms exceeded'), {
      code: 'ECONNABORTED',
    }));
    expect(db.docs.has(docPath)).toBe(true);
    await expect(acquire({ maxWaitMs: 50 })).rejects.toBeInstanceOf(ConcurrentExportError);
  });

  test('gives up with a retryable error after maxWaitMs', async () => {
    await acquireLocked();
    const startedAt = Date.now();
    const err = await acquire({ maxWaitMs: 100 }).catch((_err) => _err);
    expect(err).toBeInstanceOf(ConcurrentExportError);
    expect(err.isConcurrentExport).toBe(true);
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(80);
  });

  test('does not wait at all with maxWaitMs 0', async () => {
    await acquireLocked();
    const startedAt = Date.now();
    await expect(acquire({ maxWaitMs: 0 })).rejects.toBeInstanceOf(ConcurrentExportError);
    expect(Date.now() - startedAt).toBeLessThan(50);
  });

  test('takes over a stale lock, then the renewed lock is busy', async () => {
    db.docs.set(docPath, { lockId: 'dead', lockedAt: minutesAgo(2) });
    expect((await acquire()).isLocked).toBe(true);
    expect(db.docs.get(docPath)?.lockId).not.toBe('dead');
    await expect(acquire({ maxWaitMs: 0 })).rejects.toBeInstanceOf(ConcurrentExportError);
  });

  test('takes over a doc without lockedAt instead of locking forever', async () => {
    db.docs.set(docPath, { foo: 'bar' });
    expect((await acquire()).isLocked).toBe(true);
  });

  test('recent export is returned, old export is taken over to export again', async () => {
    db.docs.set(docPath, {
      lockId: 'done',
      lockedAt: minutesAgo(0.5),
      exported: { id: 1 },
      exportedAt: Timestamp.now(),
    });
    expect(await acquire()).toEqual({ isLocked: false, exported: { id: 1 } });
    db.docs.set(docPath, {
      lockId: 'done',
      lockedAt: minutesAgo(5),
      exported: { id: 1 },
      exportedAt: minutesAgo(2),
    });
    expect((await acquire()).isLocked).toBe(true);
  });

  test('former holder of a taken over lock does not release the new one', async () => {
    const formerHolder = await acquireLocked();
    db.docs.get(docPath)!.lockedAt = minutesAgo(2);
    await acquireLocked();
    await formerHolder.fail(new Error('Bling Customer not found'));
    expect(db.docs.has(docPath)).toBe(true);
    await expect(acquire({ maxWaitMs: 0 })).rejects.toBeInstanceOf(ConcurrentExportError);
  });

  test('exports unlocked when Firestore is unavailable', async () => {
    db.state.isDown = true;
    const lock = await acquireLocked();
    lock.setSending();
    await expect(lock.complete({ id: 1 })).resolves.toBeUndefined();
    await expect(lock.fail(new Error('timeout'))).resolves.toBeUndefined();
    db.state.isDown = false;
    expect(db.docs.size).toBe(0);
  });
});
