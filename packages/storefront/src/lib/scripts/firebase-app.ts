import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(window.$firebaseConfig);

export default firebaseApp;

export { firebaseApp };

export {
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
  // updateProfile,
} from 'firebase/auth';

export {
  getRemoteConfig,
  fetchAndActivate as rcFetchAndActivate,
  getValue as rcGetValue,
} from 'firebase/remote-config';
