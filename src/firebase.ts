import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAc04JrEQB-4C3r0pLmFaJ86BPcdtR30Wg",
  authDomain: "cloud-test-6d446.firebaseapp.com",
  databaseURL: "https://cloud-test-6d446-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cloud-test-6d446",
  storageBucket: "cloud-test-6d446.firebasestorage.app",
  messagingSenderId: "152129125724",
  appId: "1:152129125724:web:0edfb53a5b2f30c97ed599"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;