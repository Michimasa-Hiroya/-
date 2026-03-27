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

// Initialize Firebase and export instances
let app: any = null;
let db: any = null;
let auth: any = null;
let initError: string | null = null;

// Function to initialize Firebase
async function initializeFirebase() {
  if (!firebaseConfig.apiKey) {
    try {
      // @ts-ignore
      const module = await import('./firebase-applet-config.json');
      firebaseConfig = { ...firebaseConfig, ...module.default };
    } catch (e) {
      console.warn("Could not load Firebase config from environment or JSON file.");
    }
  }

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
  }
}

// Start initialization immediately
// Note: We still export db and auth, but they might be null initially.
// The app components should handle null db/auth gracefully or wait for initialization.
initializeFirebase();

export { db, auth, initError };
