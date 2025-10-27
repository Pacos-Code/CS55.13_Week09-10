// enforces that this code can only be called on the server
/**
 * FIREBASE SERVER-SIDE AUTHENTICATION MODULE
 * 
 * This module handles Firebase authentication on the server-side for Next.js
 * Server Components and API routes. It retrieves user authentication tokens
 * from cookies and creates authenticated Firebase app instances for server-side operations.
 */

// Enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import "server-only";

import { cookies } from "next/headers";
import { initializeServerApp, initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

// Returns an authenticated client SDK instance for use in Server Side Rendering
// and Static Site Generation

/**
 * Create an authenticated Firebase app instance for server-side operations
 * This function retrieves the user's ID token from cookies and creates a Firebase
 * app instance that can be used for authenticated server-side database operations
 * 
 * @returns {Object} - Object containing the authenticated Firebase app and current user
 */
export async function getAuthenticatedAppForUser() {
  // Retrieve the user's ID token from the session cookie
  const authIdToken = (await cookies()).get("__session")?.value;

  // Firebase Server App is a new feature in the JS SDK that allows you to
  // instantiate the SDK with credentials retrieved from the client & has
  // other affordances for use in server environments.
  const firebaseServerApp = initializeServerApp(
    // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
    initializeApp(),
    {
      authIdToken, // Use the ID token from the client for server-side authentication
    }
  );

  // Get the auth instance and wait for it to be ready
  const auth = getAuth(firebaseServerApp);
  await auth.authStateReady();

  // Return both the authenticated app and the current user
  return { firebaseServerApp, currentUser: auth.currentUser };
}