import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
// On Render, these are loaded from Environment Variables
// On Local, you can use a .env file or the firebase-applet-config.json if it exists
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)"
};

// Initialize Firebase and export instances
let app: any = null;
let db: any = null;
let auth: any = null;
let initError: string | null = null;

try {
  if (firebaseConfig.apiKey) {
    app = firebaseApp.initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
    auth = getAuth(app);
  } else {
    // If environment variables are missing, we can't initialize.
    // This will happen on Render if the variables aren't set yet.
    throw new Error("Firebase configuration is missing. Please set VITE_FIREBASE_* environment variables.");
  }
} catch (e: any) {
  console.error("Firebase Initialization Error:", e);
  initError = e.message || "An unknown error occurred during Firebase initialization.";
}

export { db, auth, initError };
