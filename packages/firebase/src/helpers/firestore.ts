/* eslint-disable import/prefer-default-export */
// Ref.: https://firebase.google.com/docs/firestore/manage-data/delete-data
import type { Firestore, Query } from 'firebase-admin/firestore';

const _deleteQueryBatch = async (
  db: Firestore,
  query: Query,
  resolve: (...args: any[]) => void,
) => {
  const snapshot = await query.get();
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  // Recurse on the next process tick to avoid exploding the stack
  process.nextTick(() => {
    _deleteQueryBatch(db, query, resolve);
  });
};

export const deleteQueryBatch = async (db: Firestore, query: Query) => {
  return new Promise((resolve, reject) => {
    _deleteQueryBatch(db, query, resolve).catch(reject);
  });
};
