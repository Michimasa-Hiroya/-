import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Try to load from environment variables first (for Render/Production)
// Then fallback to the JSON file (for local development)
let firebaseConfig: any;

try {
  // Vite uses import.meta.env
  const env = import.meta.env;
  if (env.VITE_FIREBASE_API_KEY) {
    firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
      firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || "(default)"
    };
  } else {
    // Fallback to the JSON file
    // @ts-ignore
    firebaseConfig = await import('./firebase-applet-config.json').then(m => m.default);
  }
} catch (e) {
  console.warn("Could not load Firebase config from environment or JSON file. Falling back to empty config.");
  firebaseConfig = {};
}

// Initialize Firebase and export instances
let app;
let db;
let auth;
let initError: string | null = null;

try {
  if (firebaseConfig.apiKey) {
    app = firebaseApp.initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
    auth = getAuth(app);
  } else {
    throw new Error("Firebase configuration is missing. Please check your environment variables or firebase-applet-config.json.");
  }
} catch (e: any) {
  console.error("Firebase Initialization Error:", e);
  initError = e.message || "An unknown error occurred during Firebase initialization.";
  app = null;
  db = null;
  auth = null;
}

export { db, auth, initError };
