import type { ResourceId } from '@cloudcommerce/types';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '@cloudcommerce/firebase/lib/config';

const firestoreColl = 'frenetTrackingCodes';

const save = (
  orderId: ResourceId,
  trackingStatus: string,
  trackingCode: string,
  serviceCode?: string,
) => new Promise((resolve) => {
  const documentRef = getFirestore().doc(`${firestoreColl}/${trackingCode}`);
  if (documentRef) {
    documentRef.set({
      orderId,
      trackingStatus,
      trackingCode,
      serviceCode,
      createdAt: new Date(),
    }).then(() => resolve(true))
      .catch((err) => {
        logger.error(err);
        resolve(false);
      });
  }
});

const get = async (
  orderId: ResourceId,
  trackingCode: string,
) => new Promise((resolve, reject) => {
  getFirestore().doc(`${firestoreColl}/${trackingCode}`)
    .get()
    .then((documentSnapshot) => {
      if (documentSnapshot && documentSnapshot.exists) {
        const data = documentSnapshot.data();
        if (data && data.orderId === orderId) {
          resolve({ ...data, createdAt: data.createdAt.toDate() });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    })
    .catch((err: any) => {
      err.name = 'TrackingCodeNotFound';
      reject(err);
    });
});

const maxAgeDays = 60;

const getDeadline = () => {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() - maxAgeDays);
  return deadline;
};

const clear = async () => {
  const docsRef = await getFirestore().collection(firestoreColl)
    .where('createdAt', '<=', getDeadline())
    .get();
  const bulkWriter = getFirestore().bulkWriter();
  docsRef.docs.forEach((doc) => {
    bulkWriter.delete(doc.ref);
  });
  await bulkWriter.close();
};

const remove = async (
  trackingCode: string,
  serviceCode: string,
) => {
  const documentSnapshot = await getFirestore().doc(`${firestoreColl}/${trackingCode}`).get();
  if (documentSnapshot.exists && documentSnapshot.data()?.serviceCode === serviceCode) {
    await documentSnapshot.ref.delete();
    return true;
  }
  return false;
};

const update = async (
  trackingStatus: string | number,
  trackingCode: string,
) => {
  await getFirestore().doc(`${firestoreColl}/${trackingCode}`).set({
    trackingStatus: String(trackingStatus),
    updateAt: new Date().toISOString(),
  }, { merge: true });
  return true;
};

const listByStatus = async (
  operator: 'in' | 'not-in',
) => {
  const docsRef = await getFirestore().collection(firestoreColl)
    .where('trackingStatus', operator, ['9', 9])
    .get();
  if (!docsRef.size) {
    const err = new Error('Tracking code not found for any store :)');
    err.name = 'NoTrackingCodesForUpdate';
    throw err;
  }
  const list: { [x: string]: any }[] = [];
  docsRef.forEach((documentSnapshot) => {
    const data = documentSnapshot.data();
    list.push({ ...data, createdAt: data.createdAt?.toDate?.() });
  });
  return list;
};

const getAll = () => listByStatus('not-in');

const getAllDelivered = () => listByStatus('in');

const db = {
  getDeadline,
  save,
  get,
  clear,
  remove,
  update,
  getAll,
  getAllDelivered,
};

export default db;

export type TrackingDoc = {
  orderId: ResourceId,
  trackingStatus: string,
  trackingCode: string,
  serviceCode: string,
  createdAt: Date,
  updateAt?: string
}
