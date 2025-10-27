import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { storage } from "@/src/lib/firebase/clientApp";

import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore";

/**
 * Upload a restaurant image to Firebase Storage and update the Firestore photo URL.
 *
 * @param {string} restaurantId - Target restaurant ID
 * @param {{ name: string }} image - File object selected by the user
 * @returns {Promise<string|undefined>} Public download URL of the uploaded image
 */
export async function updateRestaurantImage(restaurantId, image) {
    try {
      if (!restaurantId) {
        throw new Error("No restaurant ID has been provided.");
      }
  
      if (!image || !image.name) {
        throw new Error("A valid image has not been provided.");
      }
  
      const publicImageUrl = await uploadImage(restaurantId, image);
      await updateRestaurantImageReference(restaurantId, publicImageUrl);
  
      return publicImageUrl;
    } catch (error) {
      console.error("Error processing request:", error);
    }
  }
  
/**
 * Upload an image file to Firebase Storage and return its download URL.
 *
 * @param {string} restaurantId
 * @param {{ name: string }} image
 * @returns {Promise<string>}
 */
  async function uploadImage(restaurantId, image) {
    const filePath = `images/${restaurantId}/${image.name}`;
    const newImageRef = ref(storage, filePath);
    await uploadBytesResumable(newImageRef, image);
  
    return await getDownloadURL(newImageRef);
  }