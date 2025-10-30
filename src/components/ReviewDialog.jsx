"use client";

// This components handles the review dialog and uses a next.js feature known as Server Actions to handle the form submission

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import RatingPicker from "@/src/components/RatingPicker.jsx";
import { handleReviewFormSubmission } from "@/src/app/actions.js";
import { uploadUserReviewImage } from "@/src/lib/firebase/storage.js";

/**
 * ReviewDialog component renders a modal for submitting a car review.
 * It uses a form action (Server Action) to submit the review and hides itself on submit.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is currently open.
 * @param {Function} props.handleClose - Callback to close the dialog.
 * @param {{ rating: number, text: string }} props.review - Current review state.
 * @param {(value: string|number, name: "rating"|"text") => void} props.onChange - Change handler for review inputs.
 * @param {string} props.userId - ID of the user submitting the review.
 * @param {string} props.id - Car ID being reviewed.
 * @returns {JSX.Element}
 */
const ReviewDialog = ({
  isOpen,
  handleClose,
  review,
  onChange,
  userId,
  id,
}) => {
  const dialog = useRef();
  const [photoUrl, setPhotoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // dialogs only render their backdrop when called with `showModal`
  useLayoutEffect(() => {
    if (isOpen) {
      dialog.current.showModal();
    } else {
      dialog.current.close();
    }
  }, [isOpen, dialog]);

  const handleClick = (e) => {
    // close if clicked outside the modal
    if (e.target === dialog.current) {
      handleClose();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadUserReviewImage(userId, id, file);
      setPhotoUrl(url || "");
    } catch (err) {
      console.error("Image upload failed", err);
      setPhotoUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      <form
        action={handleReviewFormSubmission}
        onSubmit={() => {
          handleClose();
        }}
      >
        <header>
          <h3>Add your review</h3>
        </header>
        <article>
          <RatingPicker />

          <p>
            <input
              type="text"
              name="text"
              id="review"
              placeholder="Write your thoughts here"
              required
              value={review.text}
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          <p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </p>

          <input type="hidden" name="carId" value={id} />
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="photoUrl" value={photoUrl} />
        </article>
        <footer>
          <menu>
            <button
              autoFocus
              type="reset"
              onClick={handleClose}
              className="button--cancel"
            >
              Cancel
            </button>
            <button type="submit" value="confirm" className="button--confirm" disabled={isUploading}>
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

export default ReviewDialog;
