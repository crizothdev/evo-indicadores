import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC0URiBTrOwx1kJM3N3CawGx6YU191621s',
  authDomain: 'evo-indicadores.firebaseapp.com',
  projectId: 'evo-indicadores',
  storageBucket: 'evo-indicadores.firebasestorage.app',
  messagingSenderId: '437549546365',
  appId: '1:437549546365:web:ef44b1b024f75b65782a14',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
