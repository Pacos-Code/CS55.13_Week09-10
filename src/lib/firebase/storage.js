import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { storage } from "@/src/lib/firebase/clientApp";

import { updateCarImageReference } from "@/src/lib/firebase/firestore";

/**
 * Upload a car image to Firebase Storage and update the Firestore photo URL.
 *
 * @param {string} carId - Target car ID
 * @param {{ name: string }} image - File object selected by the user
 * @returns {Promise<string|undefined>} Public download URL of the uploaded image
 */
export async function updateCarImage(carId, image) {
    try {
      if (!carId) {
        throw new Error("No car ID has been provided.");
      }
  
      if (!image || !image.name) {
        throw new Error("A valid image has not been provided.");
      }
  
      const publicImageUrl = await uploadImage(carId, image);
      await updateCarImageReference(carId, publicImageUrl);
  
      return publicImageUrl;
    } catch (error) {
      console.error("Error processing request:", error);
    }
  }

  
/**
 * Upload an image file to Firebase Storage and return its download URL.
 *
 * @param {string} carId
 * @param {{ name: string }} image
 * @returns {Promise<string>}
 */
  async function uploadImage(carId, image) {
    const filePath = `images/${carId}/${image.name}`;
    const newImageRef = ref(storage, filePath);
    await uploadBytesResumable(newImageRef, image);
  
    return await getDownloadURL(newImageRef);
  }

/**
 * Upload a single reviewer image to Firebase Storage under userUpload/{userId}/{carId}/
 * and return its public download URL.
 *
 * @param {string} userId
 * @param {string} carId
 * @param {{ name: string }} image
 * @returns {Promise<string>}
 */
export async function uploadUserReviewImage(userId, carId, image) {
  if (!userId) {
    throw new Error("No user ID has been provided.");
  }
  if (!carId) {
    throw new Error("No car ID has been provided.");
  }
  if (!image || !image.name) {
    throw new Error("A valid image has not been provided.");
  }

  const filePath = `userUpload/${userId}/${carId}/${image.name}`;
  const imageRef = ref(storage, filePath);
  await uploadBytesResumable(imageRef, image);
  return await getDownloadURL(imageRef);
}
