import { getApp, getApps, initializeApp } from "firebase/app";
import { Platform } from "react-native";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

// Auth with persistence — keeps user logged in after restart
export const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? browserLocalPersistence 
    : getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
