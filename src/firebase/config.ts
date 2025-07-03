import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBUfC8_cx9rdkIc4gwzWC9W9iv9CFZRnQM",
  authDomain: "user-story-generator-2c560.firebaseapp.com",
  projectId: "user-story-generator-2c560",
  storageBucket: "user-story-generator-2c560.firebasestorage.app",
  messagingSenderId: "356758412513",
  appId: "1:356758412513:web:ad1eeaa8c35a367e76eba0",
  measurementId: "G-W83M77ZBNK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);