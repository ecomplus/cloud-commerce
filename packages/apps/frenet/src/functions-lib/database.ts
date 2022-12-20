import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';

const firestoreColl = 'frenetTrackingCodes';

const save = (
  orderId: string,
  trackingStatus: string,
  trackingCode: string,
  serviceCode: string,
) => {
  const documentRef = getFirestore().doc(`${firestoreColl}/${trackingCode}`);
  if (documentRef) {
    documentRef.set({
      orderId,
      trackingStatus,
      trackingCode,
      serviceCode,
      createdAt: new Date(),
    })
      .catch(logger.error);
  }
};

const get = async (
  orderId: string,
  trackingCode: string,
) => new Promise((resolve) => {
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
    });
});

const clear = async () => new Promise((resolve) => {
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() - 2);

  getFirestore().collection(firestoreColl)
    .where('createdAt', '<=', deadline)
    .get()
    .then((docsRef) => {
      docsRef.docs.forEach((doc) => {
        doc.ref.delete();
      });
      resolve(true);
    });
});

const remove = async (
  trackingCode: string,
  serviceCode: string,
) => new Promise((resolve) => {
  getFirestore().doc(`${firestoreColl}/${trackingCode}`)
    .get()
    .then(async (documentSnapshot) => {
      if (documentSnapshot && documentSnapshot.exists) {
        const data = documentSnapshot.data();
        if (data && data.serviceCode === serviceCode) {
          await documentSnapshot.ref.delete();
          resolve(true);
        }
      }
      resolve(false);
    });
});

const update = async (
  trackingStatus: string,
  trackingCode: string,
) => new Promise((resolve) => {
  const documentRef = getFirestore().doc(`${firestoreColl}/${trackingCode}`);
  if (documentRef) {
    documentRef.set({
      trackingStatus,
      updateAt: new Date().toISOString(),
    }, { merge: true })
      .then(() => resolve(true));
  }
});

const getAll = () => new Promise((resolve, reject) => {
  getFirestore().collection(firestoreColl)
    .where('trackingStatus', '!=', '9')
    .get()
    .then((docsRef) => {
      if (docsRef.size > 0) {
        const list: { [x: string]: any }[] = [];
        docsRef.forEach((documentSnapshot) => {
          if (documentSnapshot && documentSnapshot.exists) {
            const data = documentSnapshot.data();
            list.push({ ...data, createAt: data.toDate() });
          }
        });
        resolve(list);
      } else {
        const err = new Error('Tracking code not found for any store :)');
        err.name = 'NoTrackingCodesForUpdate';
        reject(err);
      }
    });
});

const getAllDelivered = () => new Promise((resolve, reject) => {
  getFirestore().collection(firestoreColl)
    .where('trackingStatus', '==', '9')
    .get()
    .then((docsRef) => {
      if (docsRef.size > 0) {
        const list: { [x: string]: any }[] = [];
        docsRef.forEach((documentSnapshot) => {
          if (documentSnapshot && documentSnapshot.exists) {
            const data = documentSnapshot.data();
            list.push({ ...data, createAt: data.toDate() });
          }
        });
        resolve(list);
      } else {
        const err = new Error('Tracking code not found for any store :)');
        err.name = 'NoTrackingCodesForUpdate';
        reject(err);
      }
    });
});

export default {
  trackingCodes: {
    save,
    get,
    clear,
    remove,
    update,
    getAll,
    getAllDelivered,
  },
};

export type TrackingDoc = {
  orderId: string,
  trackingStatus: string,
  trackingCode: string,
  serviceCode: string,
  createdAt: string,
  updateAt?: string
}
