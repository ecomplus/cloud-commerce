import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';

const firestoreColl = 'melhorEnvioTracking';

export type Lable = {
  id: string,
  labelId: string,
  status: string,
  resourceId: string,
  createdAt: Timestamp,
  updateAt?: string,
};

const searchLabel = async (resourceId: string): Promise<Lable | null> => new Promise(
  (resolve, reject) => {
    getFirestore().doc(`${firestoreColl}/${resourceId}`)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot && documentSnapshot.exists) {
          const data = documentSnapshot.data() as Lable;
          if (data) {
            resolve(data);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      })
      .catch((err: any) => {
        reject(err);
      });
  },
);

const saveLabel = (
  labelId: string,
  status: string,
  resourceId: string,
) => new Promise((resolve) => {
  const documentRef = getFirestore().doc(`${firestoreColl}/${resourceId}`);
  if (documentRef) {
    documentRef.set({
      id: resourceId,
      labelId,
      status,
      resourceId,
      createdAt: Timestamp.now(),
    }).then(() => resolve(true))
      .catch(logger.error);
  }
});

const getAllLabels = (): Promise<Lable[]> => new Promise((resolve, reject) => {
  getFirestore().collection(firestoreColl).get()
    .then((docsRef) => {
      if (docsRef.size > 0) {
        const list: Lable[] = [];
        docsRef.forEach((documentSnapshot) => {
          if (documentSnapshot && documentSnapshot.exists) {
            const data = documentSnapshot.data() as Lable;
            list.push(data);
          }
        });
        resolve(list);
      } else {
        const err = new Error('No label');
        reject(err);
      }
    })
    .catch(reject);
});

const updateLabel = async (
  status: string,
  labelId: string,
): Promise<boolean> => new Promise((resolve, reject) => {
  getFirestore().collection(firestoreColl)
    .where('labelId', '==', labelId)
    .get()
    .then((docsRef) => {
      if (docsRef.size > 0) {
        docsRef.forEach(async (documentSnapshot) => {
          if (documentSnapshot && documentSnapshot.exists) {
            const documentRef = documentSnapshot.ref;
            await documentRef.set({
              status,
              updateAt: new Date().toISOString(),
            }, { merge: true });
          }
        });
      }
      resolve(true);
    })
    .catch(reject);
});

const deleteLabel = async (id: string): Promise<boolean> => new Promise((resolve, reject) => {
  getFirestore().doc(`${firestoreColl}/${id}`)
    .get()
    .then(async (documentSnapshot) => {
      if (documentSnapshot && documentSnapshot.exists) {
        const data = documentSnapshot.data();
        if (data) {
          await documentSnapshot.ref.delete();
          resolve(true);
        }
      }
      resolve(false);
    })
    .catch(reject);
});

const clearLabels = async (): Promise<boolean> => new Promise((resolve, reject) => {
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
    })
    .catch(reject);
});

const db = {
  searchLabel,
  saveLabel,
  getAllLabels,
  updateLabel,
  deleteLabel,
  clearLabels,
};

export default db;
