import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
  // updateProfile,
} from 'firebase/auth';

const firebaseApp = initializeApp(window.firebaseConfig);

export default firebaseApp;

export {
  firebaseApp,
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
};
