import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Initialize Firebase telemetry
enableFirebaseTelemetry();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: 'salary-genkit',
  storageBucket: 'salary-genkit.appspot.com',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export default app;
