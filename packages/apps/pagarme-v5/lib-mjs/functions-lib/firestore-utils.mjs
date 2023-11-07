import logger from 'firebase-functions/logger';

const getDocFirestore = async (collection, documentId) => {
  const documentSnapshot = await collection.doc(documentId).get();
  let data;
  if (documentSnapshot) {
    data = documentSnapshot.data();
  }
  return data;
};

const updateDocFirestore = async (collection, documentId, body) => {
  const updatedAt = new Date().toISOString();
  body.updatedAt = updatedAt;

  await collection.doc(documentId)
    .set(body, { merge: true })
    .catch(logger.error);
};

export {
  getDocFirestore,
  updateDocFirestore,
};
