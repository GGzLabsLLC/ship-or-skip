import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBHSEEvO-SuzfuBBcXyEvugR66oSQkeB28",
  authDomain: "shiporskip-app.firebaseapp.com",
  projectId: "shiporskip-app",
  storageBucket: "shiporskip-app.firebasestorage.app",
  messagingSenderId: "1037379519890",
  appId: "1:1037379519890:web:aa5b05a804b5b08a35ed4b",
  measurementId: "G-PD6FJ542F9",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics (safe in browser only)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

if (import.meta.env.DEV) {
  console.log("firebase.js loaded");
  console.log("Firebase Project:", firebaseConfig.projectId);
  console.log("db app projectId:", db.app.options.projectId);
}

export { app, analytics };
