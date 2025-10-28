"use client";

// This components shows one individual car
// It receives data from src/app/car/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { getCarSnapshotById } from "@/src/lib/firebase/firestore.js";
import { useUser } from "@/src/lib/getUser";
import CarDetails from "@/src/components/CarDetails.jsx";
import { updateCarImage } from "@/src/lib/firebase/storage.js";

const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

/**
 * Car component displays a single car page with details,
 * live updates via Firestore snapshot, optional review dialog for logged-in users,
 * and image upload handling that persists to Firebase Storage and Firestore.
 *
 * @param {Object} props
 * @param {string} props.id - Car ID.
 * @param {Object} props.initialCar - Initial car data for SSR/first paint.
 * @param {string} [props.initialUserId] - Initial user ID if known on the server.
 * @param {React.ReactNode} props.children - Nested content (e.g., reviews list).
 * @returns {JSX.Element}
 */
export default function Car({
  id,
  initialCar,
  initialUserId,
  children,
}) {
  const [carDetails, setCarDetails] = useState(initialCar);
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
  };

  async function handleCarImage(target) {
    const image = target.files ? target.files[0] : null;
    if (!image) {
      return;
    }

    const imageURL = await updateCarImage(id, image);
    setCarDetails({ ...carDetails, photo: imageURL });
  }

  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" });
  };

  useEffect(() => {
    return getCarSnapshotById(id, (data) => {
      setCarDetails(data);
    });
  }, [id]);

  return (
    <>
      <CarDetails
        car={carDetails}
        userId={userId}
        handleCarImage={handleCarImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </CarDetails>
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}

