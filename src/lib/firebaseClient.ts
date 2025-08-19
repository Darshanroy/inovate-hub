"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, RecaptchaVerifier, type ApplicationVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseConfig.apiKey) {
    throw new Error("Missing Firebase env config. Set NEXT_PUBLIC_FIREBASE_* variables.");
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}

export function getOrCreateRecaptchaVerifier(auth: Auth, containerId: string = "recaptcha-container"): ApplicationVerifier {
  if (typeof window === "undefined") {
    throw new Error("Recaptcha can only be initialized in the browser");
  }
  const existing = (window as any).recaptchaVerifier as RecaptchaVerifier | undefined;
  if (existing) return existing;

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
  });
  (window as any).recaptchaVerifier = verifier;
  return verifier;
}
