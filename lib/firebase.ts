import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBat7RAiQl2MYSnfAc8LTMcKyeXQkr6lfI",
  authDomain: "cxbulk.firebaseapp.com",
  projectId: "cxbulk",
  storageBucket: "cxbulk.firebasestorage.app",
  messagingSenderId: "536141227531",
  appId: "1:536141227531:web:f29a1510d8e66edfdbc90e",
  measurementId: "G-0Q405Q3YTF"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
