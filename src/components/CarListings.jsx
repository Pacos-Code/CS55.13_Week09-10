"use client";

// This components handles the car listings page
// It receives data from src/app/page.jsx, such as the initial cars and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getCarsSnapshot } from "@/src/lib/firebase/firestore.js";
import Filters from "@/src/components/Filters.jsx";

const CarItem = ({ car }) => (
  <li key={car.id}>
    <Link href={`/car/${car.id}`}>
      <ActiveCar car={car} />
    </Link>
  </li>
);

const ActiveCar = ({ car }) => (
  <div>
    <ImageCover photo={car.photo} name={car.name} />
    <CarDetails car={car} />
  </div>
);

const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const CarDetails = ({ car }) => (
  <div className="car__details">
    <h2>{car.name}</h2>
    <CarRating car={car} />
    <CarMetadata car={car} />
  </div>
);

const CarRating = ({ car }) => (
  <div className="car__rating">
    <ul>{renderStars(car.avgRating)}</ul>
    <span>({car.numRatings})</span>
  </div>
);

const CarMetadata = ({ car }) => (
  <div className="car__meta">
    <p>
      {car.type} | {car.year}
    </p>
    <p>{"$".repeat(car.price)}</p>
  </div>
);

export default function CarListings({
  initialCars,
  searchParams,
}) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    make: searchParams.make || "",
    type: searchParams.type || "",
    country: searchParams.country || "",
    price: searchParams.price || "",
    sort: searchParams.sort || "",
  };

  const [cars, setCars] = useState(initialCars);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
    return getCarsSnapshot((data) => {
      setCars(data);
    }, filters);
  }, [filters]);

  return (
    <article>
      <Filters filters={filters} setFilters={setFilters} />
      <ul className="cars">
        {cars.map((car) => (
          <CarItem key={car.id} car={car} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}

