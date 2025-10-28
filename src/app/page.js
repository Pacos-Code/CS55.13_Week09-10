/**
 * HOME PAGE COMPONENT - Server-Side Rendered Car Listings
 * 
 * This is the main page component that displays the car listings.
 * It's configured for server-side rendering to ensure data is fetched and
 * rendered on the server before being sent to the client for better SEO and performance.
 */

import CarListings from "@/src/components/CarListings.jsx";
import { getCars } from "@/src/lib/firebase/firestore.js";
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
  // ?make=Honda&type=Sedan&sort=Review
  const searchParams = await props.searchParams;
  
  // Get authenticated Firebase server app instance for server-side data access
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  
  // Fetch cars from Firestore using server-side authentication and search filters
  const cars = await getCars(
    getFirestore(firebaseServerApp),
    searchParams
  );
  
  // Render the main page with car listings component
  return (
    <main className="main__home">
      <CarListings
        initialCars={cars}
        searchParams={searchParams}
      />
    </main>
  );
}
