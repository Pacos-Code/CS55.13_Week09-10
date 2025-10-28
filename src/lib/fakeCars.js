import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData, getAllMakes, getModelsForMake } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";

export async function generateFakeCarsAndReviews() {
  const carsToAdd = 5;
  const data = [];

  for (let i = 0; i < carsToAdd; i++) {
    const carTimestamp = Timestamp.fromDate(getRandomDateBefore());

    const ratingsData = [];

    // Generate a random number of ratings/reviews for this car
    for (let j = 0; j < randomNumberBetween(0, 5); j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(carTimestamp.toDate())
      );

      const ratingData = {
        rating:
          randomData.carReviews[
            randomNumberBetween(0, randomData.carReviews.length - 1)
          ].rating,
        text: randomData.carReviews[
          randomNumberBetween(0, randomData.carReviews.length - 1)
        ].text,
        userId: `User #${randomNumberBetween()}`,
        timestamp: ratingTimestamp,
      };

      ratingsData.push(ratingData);
    }

    const avgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;

    // Get a random make
    const makes = getAllMakes();
    const make = makes[randomNumberBetween(0, makes.length - 1)];
    
    // Get a random model for that make
    const models = getModelsForMake(make);
    const model = models[randomNumberBetween(0, models.length - 1)];
    
    const year = randomNumberBetween(2018, 2025);

    const carData = {
      type:
        randomData.carTypes[
          randomNumberBetween(0, randomData.carTypes.length - 1)
        ],
      name: `${make} ${model} (${year})`,
      make: make,
      year: year,
      avgRating,
      country: randomData.makeToCountry[make] || "USA",
      numRatings: ratingsData.length,
      sumRating: ratingsData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.rating,
        0
      ),
      price: randomNumberBetween(1, 4),
      photo: `https://storage.googleapis.com/firestorequickstarts.appspot.com/food_${randomNumberBetween(
        1,
        22
      )}.png`,
      timestamp: carTimestamp,
    };

    data.push({
      carData,
      ratingsData,
    });
  }
  return data;
}
