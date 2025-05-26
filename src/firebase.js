// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyChGgW7MuwBIFbNrMqsL--VFO-RuCHzKJg',
  authDomain: 'xfind-rental-app-30361.firebaseapp.com',
  projectId: 'xfind-rental-app-30361',
  storageBucket: 'xfind-rental-app-30361.firebasestorage.app', // <==== 這裡
  messagingSenderId: '358023747355',
  appId: '1:358023747355:web:955a397125e91782e0a5be',
  measurementId: 'G-9HP8MD8S6D',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);