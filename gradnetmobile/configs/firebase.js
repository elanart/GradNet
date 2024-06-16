import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDpsDg24eYA2TkxIx6_w4swbNLtUEWut0s",
  authDomain: "gradnetfirebase.firebaseapp.com",
  databaseURL:
    "https://gradnetfirebase-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gradnetfirebase",
  storageBucket: "gradnetfirebase.appspot.com",
  messagingSenderId: "425927603425",
  appId: "1:425927603425:web:dec4c4c9417203f0db73a0",
  measurementId: "G-4QD9XQE8WM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };
export const database = getFirestore(app);
