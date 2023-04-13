import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';

const firestoreColl = 'payPalTransactions';

const save = (transactionCode, orderId) => new Promise((resolve) => {
  const documentRef = getFirestore().doc(`${firestoreColl}/${transactionCode}`);
  if (documentRef) {
    documentRef.set({
      transactionCode,
      orderId,
      createdAt: new Date(),
    }).then(() => resolve(true))
      .catch(logger.error);
  }
});

const get = async (transactionCode) => new Promise((resolve, reject) => {
  getFirestore().doc(`${firestoreColl}/${transactionCode}`)
    .get()
    .then((documentSnapshot) => {
      if (documentSnapshot && documentSnapshot.exists) {
        const data = documentSnapshot.data();
        resolve({ ...data, createdAt: data.createdAt.toDate() });
      } else {
        resolve(null);
      }
    })
    .catch((err) => {
      err.name = 'TransactionCodeNotFound';
      reject(err);
    });
});

const remove = async (transactionCode) => new Promise((resolve) => {
  getFirestore().doc(`${firestoreColl}/${transactionCode}`)
    .get()
    .then(async (documentSnapshot) => {
      if (documentSnapshot && documentSnapshot.exists) {
        await documentSnapshot.ref.delete();
        resolve(true);
      }
      resolve(false);
    });
});

export {
  get,
  save,
  remove,
};
