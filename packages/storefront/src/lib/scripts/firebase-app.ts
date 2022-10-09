import { initializeApp } from 'firebase/app';

const app = initializeApp(window.firebaseConfig);

export default app;

export const firebaseApp = app;
