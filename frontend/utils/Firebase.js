import {getAuth, GoogleAuthProvider} from 'firebase/auth'
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "dhanushdigital-eb3d5.firebaseapp.com",
  projectId: "dhanushdigital-eb3d5",
  storageBucket: "dhanushdigital-eb3d5.firebasestorage.app",
  messagingSenderId: "347010630303",
  appId: "1:347010630303:web:0e8a2b80bd45322e8358aa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()


export {auth, provider}