/**
 * FIREBASE AUTHENTICATION MODULE
 * 
 * This module provides authentication functions for the application, including
 * Google OAuth sign-in, sign-out, and authentication state listeners.
 * It wraps Firebase Auth methods to provide a consistent interface for the app.
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
} from "firebase/auth";

import { auth } from "@/src/lib/firebase/clientApp";

// Listen for authentication state changes (user sign-in/sign-out)
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

// Listen for ID token changes (used for server-side authentication)
export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb);
}

// Sign in user with Google OAuth using popup
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
}

// Sign out the current user
export async function signOut() {
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}