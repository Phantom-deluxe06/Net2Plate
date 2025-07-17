import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5LVvxliXalwWntSyFa5WvyOtNkaQjBKY",
  authDomain: "fishlink-4cb67.firebaseapp.com",
  projectId: "fishlink-4cb67",
  storageBucket: "fishlink-4cb67.appspot.com",
  messagingSenderId: "177862102325",
  appId: "1:177862102325:web:c6b0f9e8ac550f77d107c",
  measurementId: "G-7G7L6M8LCP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);