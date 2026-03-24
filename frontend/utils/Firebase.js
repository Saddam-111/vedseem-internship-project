import {getAuth, GoogleAuthProvider} from 'firebase/auth'
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you 


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "logindhanushdigital.firebaseapp.com",
  projectId: "logindhanushdigital",
  storageBucket: "logindhanushdigital.firebasestorage.app",
  messagingSenderId: "874385692724",
  appId: "1:874385692724:web:e042e74d59e6e8e77a1261"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()


export {auth, provider}