import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(window.firebaseConfig);

export default firebaseApp;

export { firebaseApp };

export {
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
  // updateProfile,
} from 'firebase/auth';
