import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Try to load from environment variables first (for Render/Production)
// Then fallback to the JSON file (for local development)
let firebaseConfig: any = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)"
};

// If environment variables are missing, try to load from the local JSON file
// We use a dynamic import with a variable to prevent Rollup from failing the build if the file is missing
if (!firebaseConfig.apiKey) {
  try {
    const configPath = './firebase-applet-config.json';
    const module = await import(/* @vite-ignore */ configPath);
    firebaseConfig = module.default;
  } catch (e) {
    console.warn("Could not load Firebase config from environment or JSON file.");
  }
}

// Initialize Firebase and export instances
let app;
let db;
let auth;
let initError: string | null = null;

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    app = firebaseApp.initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
    auth = getAuth(app);
  } else {
    throw new Error("Firebase configuration is missing. Please check your environment variables on Render.");
  }
} catch (e: any) {
  console.error("Firebase Initialization Error:", e);
  initError = e.message || "An unknown error occurred during Firebase initialization.";
  app = null;
  db = null;
  auth = null;
}

export { db, auth, initError };
