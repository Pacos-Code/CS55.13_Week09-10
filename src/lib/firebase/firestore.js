/**
 * FIRESTORE DATABASE MODULE
 * 
 * This module provides all database operations for the restaurant application,
 * including CRUD operations for restaurants and reviews, real-time data subscriptions,
 * and data seeding functionality. It handles both server-side and client-side database access.
 */

import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";

import { db } from "@/src/lib/firebase/clientApp";

/**
 * Update the `photo` field of a restaurant document to reference a public image URL.
 *
 * @param {string} restaurantId - Target restaurant document ID
 * @param {string} publicImageUrl - Publicly accessible image URL
 * @returns {Promise<void>}
 */
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

/**
 * Atomically updates aggregate rating fields on a restaurant document and
 * writes the individual rating document within a transaction.
 *
 * @param {import("firebase/firestore").Transaction} transaction
 * @param {import("firebase/firestore").DocumentReference} docRef
 * @param {import("firebase/firestore").DocumentReference} newRatingDocument
 * @param {{ rating: number, text: string, userId?: string }} review
 */
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  const restaurant = await transaction.get(docRef);
  const data = restaurant.data();
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  const newAverage = newSumRating / newNumRatings;

  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
    //Add new field for userId making review to use as security check
    lastReviewUserId: review.userId,
  });

  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};

/**
 * Add a review to a restaurant using a Firestore transaction, updating
 * aggregate fields and inserting the new rating document.
 *
 * @param {import("firebase/firestore").Firestore} db - Firestore instance
 * @param {string} restaurantId - Target restaurant ID
 * @param {{ rating: number, text: string, userId?: string }} review - Review payload
 * @returns {Promise<void>}
 */
export async function addReviewToRestaurant(db, restaurantId, review) {
  if (!restaurantId) {
          throw new Error("No restaurant ID has been provided.");
  }

  if (!review) {
          throw new Error("A valid review has not been provided.");
  }

  try {
          const docRef = doc(collection(db, "restaurants"), restaurantId);
          const newRatingDocument = doc(
                  collection(db, `restaurants/${restaurantId}/ratings`)
          );

          // corrected line
          await runTransaction(db, transaction =>
                  updateWithRating(transaction, docRef, newRatingDocument, review)
          );
  } catch (error) {
          console.error(
                  "There was an error adding the rating to the restaurant",
                  error
          );
          throw error;
  }
}
/**
 * Apply filtering and sorting parameters to a Firestore query
 * @param {Query} q - The base Firestore query
 * @param {Object} filters - Filtering options (category, city, price, sort)
 * @returns {Query} - Modified query with filters applied
 */
function applyQueryFilters(q, { category, city, price, sort }) {
  // Filter by restaurant category (e.g., "Indian", "Mexican")
  if (category) {
    q = query(q, where("category", "==", category));
  }
  // Filter by city location
  if (city) {
    q = query(q, where("city", "==", city));
  }
  // Filter by price level (based on price string length: $, $$, $$$)
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  // Sort by average rating (default) or number of reviews
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  return q;
}

/**
 * Fetch restaurants from Firestore with optional filtering and sorting
 * @param {Firestore} db - Firestore database instance (can be client or server)
 * @param {Object} filters - Filtering options (category, city, price, sort)
 * @returns {Array} - Array of restaurant objects with converted timestamps
 */
export async function getRestaurants(db = db, filters = {}) {
  // Start with base query for restaurants collection
  let q = query(collection(db, "restaurants"));

  // Apply filters and sorting
  q = applyQueryFilters(q, filters);
  const results = await getDocs(q);
  
  // Convert Firestore documents to plain objects for client/server compatibility
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

/**
 * Set up real-time listener for restaurants with optional filtering
 * @param {Function} cb - Callback function to receive restaurant updates
 * @param {Object} filters - Filtering options (category, city, price, sort)
 * @returns {Function} - Unsubscribe function to stop listening
 */
export function getRestaurantsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Create filtered query for real-time updates
  let q = query(collection(db, "restaurants"));
  q = applyQueryFilters(q, filters);

  // Set up real-time listener that triggers on data changes
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        // Convert Firestore Timestamp to JavaScript Date for serialization
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Call the callback with updated restaurant data
    cb(results);
  });
}

/**
 * Fetch a single restaurant by its ID
 * @param {Firestore} db - Firestore database instance
 * @param {string} restaurantId - The ID of the restaurant to fetch
 * @returns {Object|null} - Restaurant object with converted timestamp, or null if not found
 */
export async function getRestaurantById(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  
  const docRef = doc(db, "restaurants", restaurantId);
  const docSnap = await getDoc(docRef);
  
  return {
    ...docSnap.data(),
    // Convert Firestore Timestamp to JavaScript Date for serialization
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

export function getRestaurantSnapshotById(restaurantId, cb) {
  return;
}

/**
 * Fetch all reviews for a specific restaurant, ordered by most recent first
 * @param {Firestore} db - Firestore database instance
 * @param {string} restaurantId - The ID of the restaurant to fetch reviews for
 * @returns {Array} - Array of review objects with converted timestamps
 */
export async function getReviewsByRestaurantId(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Query reviews subcollection, ordered by timestamp (newest first)
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  const results = await getDocs(q);
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server 
      // Convert Firestore Timestamp to JavaScript Date for serialization
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

/**
 * Set up real-time listener for reviews of a specific restaurant
 * @param {string} restaurantId - The ID of the restaurant to listen for reviews
 * @param {Function} cb - Callback function to receive review updates
 * @returns {Function} - Unsubscribe function to stop listening
 */
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Query reviews subcollection for real-time updates, ordered by timestamp
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );
  
  // Set up real-time listener that triggers when reviews change
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        // Convert Firestore Timestamp to JavaScript Date for serialization
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    // Call the callback with updated review data
    cb(results);
  });
}

/**
 * Seed the database with fake restaurant and review data for testing/demo purposes
 * This function generates sample data and adds it to the Firestore database
 */
export async function addFakeRestaurantsAndReviews() {
  // Generate fake data using the utility function
  const data = await generateFakeRestaurantsAndReviews();
  
  // Process each restaurant and its associated reviews
  for (const { restaurantData, ratingsData } of data) {
    try {
      // Add the restaurant document to the restaurants collection
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // Add each review as a subdocument in the restaurant's ratings subcollection
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
