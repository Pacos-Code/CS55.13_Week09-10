/**
 * HEADER COMPONENT - Authentication and Navigation
 * 
 * This component handles user authentication state, sign-in/sign-out functionality,
 * and manages session cookies for server-side authentication. It displays different
 * UI based on whether the user is authenticated or not.
 */

"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import {
  signInWithGoogle,
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js";
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";
import { setCookie, deleteCookie } from "cookies-next";

/**
 * Custom hook to manage user session state and sync authentication tokens
 * with server-side session cookies for seamless SSR authentication
 */
function useUserSession(initialUser) {
  useEffect(() => {
    // Listen for Firebase authentication token changes
    return onIdTokenChanged(async (user) => {
      if (user) {
        // User is signed in - store ID token in session cookie for server-side auth
        const idToken = await user.getIdToken();
        await setCookie("__session", idToken);
      } else {
        // User is signed out - remove session cookie
        await deleteCookie("__session");
      }
      
      // Prevent unnecessary page reload if user hasn't changed
      if (initialUser?.uid === user?.uid) {
        return;
      }
      
      // Reload page to sync client and server state
      window.location.reload();
    });
  }, [initialUser]);

  return initialUser;
}

export default function Header({ initialUser }) {
  // Get current user session state with automatic token synchronization
  const user = useUserSession(initialUser);

  // Handle user sign-out action
  const handleSignOut = (event) => {
    event.preventDefault();
    signOut();
  };

  // Handle user sign-in action with Google OAuth
  const handleSignIn = (event) => {
    event.preventDefault();
    signInWithGoogle();
  };

  return (
    <header>
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        Friendly Eats
      </Link>
      {user ? (
        <>
          <div className="profile">
            <p>
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {user.displayName}
            </p>

            <div className="menu">
              ...
              <ul>
                <li>{user.displayName}</li>

                <li>
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>

                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
