import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase and export instances
let app;
let db;
let auth;
let initError: string | null = null;

try {
  app = firebaseApp.initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
} catch (e: any) {
  console.error("Firebase Initialization Error:", e);
  initError = e.message || "An unknown error occurred during Firebase initialization.";
  app = null;
  db = null;
  auth = null;
}

export { db, auth, initError };
