import { getFirestore, collection, addDoc } from 'firebase/firestore/lite';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import firebaseApp from './firebase-app';

const firestore = getFirestore(firebaseApp);
if (window.$reCaptchaSiteKey) {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(window.$reCaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export default firestore;

export {
  firestore,
  collection,
  addDoc,
};

export const getFormCollRef = (form: string) => {
  return collection(firestore, `forms/p/${form}`);
};

export const addFormDoc = (form: string, data: Record<string, any>) => {
  return addDoc(getFormCollRef(form), data);
};
