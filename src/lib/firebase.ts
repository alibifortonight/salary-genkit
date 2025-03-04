// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc6_Kg_rEy-_6WF4Hc3cCuReZNa6WUduI",
  authDomain: "salary-genkit.firebaseapp.com",
  projectId: "salary-genkit",
  storageBucket: "salary-genkit.appspot.com",
  messagingSenderId: "718764042014",
  appId: "1:718764042014:web:e3e6c3d2b2b2b2b2b2b2b2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

//some comment