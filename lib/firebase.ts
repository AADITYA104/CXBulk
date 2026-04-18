import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
// @ts-ignore
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

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
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);

