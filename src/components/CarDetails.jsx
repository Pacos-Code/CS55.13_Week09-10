// This component shows car metadata, and offers some actions to the user like uploading a new car image, and adding a review.

import React from "react";
import renderStars from "@/src/components/Stars.jsx";

const CarDetails = ({
  car,
  userId,
  handleCarImage,
  setIsOpen,
  isOpen,
  children,
}) => {
  return (
    <section className="img__section">
      <img src={car.photo} alt={car.name} />

      <div className="actions">
        {userId && (
          <img
            alt="review"
            className="review"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            src="/review.svg"
          />
        )}
        <label
          onChange={(event) => handleCarImage(event.target)}
          htmlFor="upload-image"
          className="add"
        >
          <input
            name=""
            type="file"
            id="upload-image"
            className="file-input hidden w-full h-full"
          />

          <img className="add-image" src="/add.svg" alt="Add image" />
        </label>
      </div>

      <div className="details__container">
        <div className="details">
          <h2>{car.name}</h2>

          <div className="car__rating">
            <ul>{renderStars(car.avgRating)}</ul>

            <span>({car.numRatings})</span>
          </div>

          <p>
            {car.type} | {car.year}
          </p>
          <p>{"$".repeat(car.price)}</p>
          {children}
        </div>
      </div>
    </section>
  );
};

export default CarDetails;

