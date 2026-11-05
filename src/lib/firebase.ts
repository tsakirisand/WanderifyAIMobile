import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FirebaseAuthRn from "@firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import type { Auth, Persistence } from "firebase/auth";
import type { FirebaseApp as FirebaseAppType } from "firebase/app";

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(config).every((value) => typeof value === "string" && value.length > 0);
// Metro resolves @firebase/auth to its React Native entry. Its root type surface omits this RN-only export.
const getReactNativePersistence = (FirebaseAuthRn as unknown as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
}).getReactNativePersistence;

let app: FirebaseAppType | null = null;
let auth: Auth | null = null;

if (firebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(config as Record<string, string>);
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    auth = getAuth(app);
  }
}

export { app, auth };
