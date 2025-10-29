// This component shows car metadata and offers actions to the user like adding a review.

import React from "react";
import renderStars from "@/src/components/Stars.jsx";

const CarDetails = ({
  car,
  userId,
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

