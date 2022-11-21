import { getFirestore } from 'firebase-admin/firestore';

const firestoreColl = 'pix_certificates';

export default (certificate: string) => {
  let documentRef;
  if (firestoreColl) {
    documentRef = getFirestore()
      .doc(`${firestoreColl}/${certificate}`);
  }

  return new Promise((resolve, reject) => {
    if (documentRef) {
      documentRef.get()
        .then((documentSnapshot) => {
          if (!documentSnapshot.exists || !documentSnapshot.get('doc')) {
            reject(new Error('>(App: Pix) Document not found'));
          }
          const doc = documentSnapshot.get('doc');
          resolve(doc);
        });
    } else {
      reject(new Error('>(App: Pix) Document not found'));
    }
  });
};
