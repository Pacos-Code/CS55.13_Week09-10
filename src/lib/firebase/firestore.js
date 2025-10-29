/**
 * FIRESTORE DATABASE MODULE
 * 
 * This module provides all database operations for the car application,
 * including CRUD operations for cars and reviews, real-time data subscriptions,
 * and data seeding functionality. It handles both server-side and client-side database access.
 */

import { generateFakeCarsAndReviews } from "@/src/lib/fakeCars.js";

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
 * Update the `photo` field of a car document to reference a public image URL.
 *
 * @param {string} carId - Target car document ID
 * @param {string} publicImageUrl - Publicly accessible image URL
 * @returns {Promise<void>}
 */
export async function updateCarImageReference(
  carId,
  publicImageUrl
) {
  const carRef = doc(collection(db, "cars"), carId);
  if (carRef) {
    await updateDoc(carRef, { photo: publicImageUrl });
  }
}

/**
 * Atomically updates aggregate rating fields on a car document and
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
  const car = await transaction.get(docRef);
  const data = car.data();
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
 * Add a review to a car using a Firestore transaction, updating
 * aggregate fields and inserting the new rating document.
 *
 * @param {import("firebase/firestore").Firestore} db - Firestore instance
 * @param {string} carId - Target car ID
 * @param {{ rating: number, text: string, userId?: string }} review - Review payload
 * @returns {Promise<void>}
 */
export async function addReviewToCar(db, carId, review) {
  if (!carId) {
          throw new Error("No car ID has been provided.");
  }

  if (!review) {
          throw new Error("A valid review has not been provided.");
  }

  try {
          const docRef = doc(collection(db, "cars"), carId);
          const newRatingDocument = doc(
                  collection(db, `cars/${carId}/ratings`)
          );

          // corrected line
          await runTransaction(db, transaction =>
                  updateWithRating(transaction, docRef, newRatingDocument, review)
          );
  } catch (error) {
          console.error(
                  "There was an error adding the rating to the car",
                  error
          );
          throw error;
  }
}

/**
 * Apply filtering and sorting parameters to a Firestore query
 * @param {Query} q - The base Firestore query
 * @param {Object} filters - Filtering options (type, make, country, price, sort)
 * @returns {Query} - Modified query with filters applied
 */
function applyQueryFilters(q, { type, make, country, price, sort }) {
  // Filter by car type (e.g., "Sedan", "SUV", "Truck")
  if (type) {
    q = query(q, where("type", "==", type));
  }
  // Filter by make/manufacturer
  if (make) {
    q = query(q, where("make", "==", make));
  }
  // Filter by country of origin
  if (country) {
    q = query(q, where("country", "==", country));
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
 * Fetch cars from Firestore with optional filtering and sorting
 * @param {Firestore} db - Firestore database instance (can be client or server)
 * @param {Object} filters - Filtering options (type, make, country, price, sort)
 * @returns {Array} - Array of car objects with converted timestamps
 */
export async function getCars(db = db, filters = {}) {
  // Start with base query for cars collection
  let q = query(collection(db, "cars"));

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
 * Set up real-time listener for cars with optional filtering
 * @param {Function} cb - Callback function to receive car updates
 * @param {Object} filters - Filtering options (type, make, country, price, sort)
 * @returns {Function} - Unsubscribe function to stop listening
 */
export function getCarsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Create filtered query for real-time updates
  let q = query(collection(db, "cars"));
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

    // Call the callback with updated car data
    cb(results);
  });
}

/**
 * Fetch a single car by its ID
 * @param {Firestore} db - Firestore database instance
 * @param {string} carId - The ID of the car to fetch
 * @returns {Object|null} - Car object with converted timestamp, or null if not found
 */
export async function getCarById(db, carId) {
  if (!carId) {
    console.log("Error: Invalid ID received: ", carId);
    return;
  }
  
  const docRef = doc(db, "cars", carId);
  const docSnap = await getDoc(docRef);
  
  return {
    ...docSnap.data(),
    // Convert Firestore Timestamp to JavaScript Date for serialization
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

export function getCarSnapshotById(carId, cb) {
  if (!carId) {
    console.log("Error: Invalid carId received: ", carId);
    return;
  }

  const docRef = doc(db, "cars", carId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = {
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp.toDate(),
      };
      cb(data);
    }
  });
}

/**
 * Fetch all reviews for a specific car, ordered by most recent first
 * @param {Firestore} db - Firestore database instance
 * @param {string} carId - The ID of the car to fetch reviews for
 * @returns {Array} - Array of review objects with converted timestamps
 */
export async function getReviewsByCarId(db, carId) {
  if (!carId) {
    console.log("Error: Invalid carId received: ", carId);
    return;
  }

  // Query reviews subcollection, ordered by timestamp (newest first)
  const q = query(
    collection(db, "cars", carId, "ratings"),
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
 * Set up real-time listener for reviews of a specific car
 * @param {string} carId - The ID of the car to listen for reviews
 * @param {Function} cb - Callback function to receive review updates
 * @returns {Function} - Unsubscribe function to stop listening
 */
export function getReviewsSnapshotByCarId(carId, cb) {
  if (!carId) {
    console.log("Error: Invalid carId received: ", carId);
    return;
  }

  // Query reviews subcollection for real-time updates, ordered by timestamp
  const q = query(
    collection(db, "cars", carId, "ratings"),
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
 * Seed the database with fake car and review data for testing/demo purposes
 * This function generates sample data and adds it to the Firestore database
 */
export async function addFakeCarsAndReviews(userId) {
  // Generate fake data using the utility function
  const data = await generateFakeCarsAndReviews();
  
  // Process each car and its associated reviews
  for (const { carData, ratingsData } of data) {
    try {
      // Add the car document to the cars collection
      const docRef = await addDoc(
        collection(db, "cars"),
        carData
      );

      // Add each review as a subdocument in the car's ratings subcollection
      for (const ratingData of ratingsData) {
        // Ensure userId matches authenticated user to satisfy security rules
        const reviewToWrite = { ...ratingData, userId };
        await addDoc(
          collection(db, "cars", docRef.id, "ratings"),
          reviewToWrite
        );
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
