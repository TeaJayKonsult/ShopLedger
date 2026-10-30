// src/services/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc,
  addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAEV8gjcAv4wTcMwzS9ddm-ooPC8dhBj8Y",
  authDomain: "shopledger-6e10c.firebaseapp.com",
  projectId: "shopledger-6e10c",
  storageBucket: "shopledger-6e10c.firebasestorage.app",
  messagingSenderId: "693117040596",
  appId: "1:693117040596:web:799e63124085d9a91c0841"
};

// Initialize App safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
};
