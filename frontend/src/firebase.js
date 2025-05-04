import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {

  apiKey: "AIzaSyBUBaAL4v94FpfxRGAFK-u3cvMcoP6KMlU",

  authDomain: "streetsense-f9eb0.firebaseapp.com",

  projectId: "streetsense-f9eb0",

  storageBucket: "streetsense-f9eb0.firebasestorage.app",

  messagingSenderId: "966948358596",

  appId: "1:966948358596:web:83aeb8f3475bbf0b823c91"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
