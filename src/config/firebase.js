// Firebase configuration for Election Camp Management System
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase config from environment variables (or fallback to demo settings)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key-for-election-camp",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "election-camp-demo.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "election-camp-demo",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "election-camp-demo.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// For development - you can use Firestore emulator (optional)
// if (import.meta.env.VITE_DEV_MODE === 'true' && location.hostname === 'localhost') {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     console.log('Connected to Firestore emulator');
//   } catch (error) {
//     console.log('Firestore emulator connection failed:', error.message);
//   }
// }

console.log('Firebase initialized with project:', firebaseConfig.projectId);

export { db };
export default app;