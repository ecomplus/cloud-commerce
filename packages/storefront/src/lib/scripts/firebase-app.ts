import { initializeApp } from 'firebase/app';

const firebaseConfig = window.firebaseConfig || {
  apiKey: 'AIzaSyCrVzemDgpyp9i6ni7Yc5ZuEVfXYwl-4J0',
  authDomain: 'ecom2-002.firebaseapp.com',
  projectId: 'ecom2-002',
  storageBucket: 'ecom2-002.appspot.com',
  messagingSenderId: '402807248219',
  appId: '1:402807248219:web:cf7d57759751e74776367e',
  measurementId: 'G-SC592CE0GB',
};
const app = initializeApp(firebaseConfig);

export default app;

export const firebaseApp = app;
