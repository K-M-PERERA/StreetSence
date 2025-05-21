import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {


  apiKey: "AIzaSyCn1WKwQK1wHANW4vLxsqrRQqn3y_RXTbQ",

  authDomain: "streetsense-b945c.firebaseapp.com",

  projectId: "streetsense-b945c",

  storageBucket: "streetsense-b945c.firebasestorage.app",

  messagingSenderId: "712999623376",

  appId: "1:712999623376:web:00f038afac5d11c98a1cd5"

};



const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
