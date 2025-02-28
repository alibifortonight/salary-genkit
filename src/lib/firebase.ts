import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBc6_Kg_rEy-_6WF4Hc3cCuReZNa6WUduI",
    authDomain: "salary-genkit.firebaseapp.com",
    projectId: "salary-genkit",
    storageBucket: "salary-genkit.firebasestorage.app",
    messagingSenderId: "718764042014",
    appId: "1:718764042014:web:85b7811656964712ec4b0f",
    measurementId: "G-6GY6L8X20L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage with region
export const storage = getStorage(app);

// Export the app instance as well
export default app;
