import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Try to load Firebase config from the JSON file for local development
    let firebaseConfig = {};
    try {
      const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
    } catch (e) {
      console.warn("Could not read firebase-applet-config.json");
    }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        target: 'esnext'
      },
      esbuild: {
        target: 'esnext'
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // Inject Firebase config into import.meta.env
        'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY || (firebaseConfig as any).apiKey),
        'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfig as any).authDomain),
        'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID || (firebaseConfig as any).projectId),
        'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfig as any).storageBucket),
        'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfig as any).messagingSenderId),
        'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID || (firebaseConfig as any).appId),
        'import.meta.env.VITE_FIREBASE_DATABASE_ID': JSON.stringify(env.VITE_FIREBASE_DATABASE_ID || (firebaseConfig as any).firestoreDatabaseId),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
