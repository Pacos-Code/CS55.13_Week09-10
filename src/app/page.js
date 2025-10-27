/**
 * HOME PAGE COMPONENT - Server-Side Rendered Restaurant Listings
 * 
 * This is the main page component that displays the restaurant listings.
 * It's configured for server-side rendering to ensure data is fetched and
 * rendered on the server before being sent to the client for better SEO and performance.
 */

import RestaurantListings from "@/src/components/RestaurantListings.jsx";
import { getRestaurants } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";

// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it
export const dynamic = "force-dynamic";

// This line also forces this route to be server-side rendered
// export const revalidate = 0;

export default async function Home(props) {
  // Extract search parameters from URL query string for server-side filtering
  // Using searchParams allows filtering to happen on the server-side, for example:
  // ?city=London&category=Indian&sort=Review
  const searchParams = await props.searchParams;
  
  // Get authenticated Firebase server app instance for server-side data access
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  
  // Fetch restaurants from Firestore using server-side authentication and search filters
  const restaurants = await getRestaurants(
    getFirestore(firebaseServerApp),
    searchParams
  );
  
  // Render the main page with restaurant listings component
  return (
    <main className="main__home">
      <RestaurantListings
        initialRestaurants={restaurants}
        searchParams={searchParams}
      />
    </main>
  );
}
