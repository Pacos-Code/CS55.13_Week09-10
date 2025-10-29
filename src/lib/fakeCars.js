import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData, getAllMakes, getModelsForMake } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/src/lib/firebase/clientApp";

export async function generateFakeCarsAndReviews() {
  const data = [];
  const makes = getAllMakes();

  // Resolve logo URLs for each make once, using Firebase Storage
  const logoUrlByMake = Object.fromEntries(
    await Promise.all(
      makes.map(async (make) => {
        const storagePath = randomData.makeToLogoUrl[make];
        try {
          if (storagePath) {
            const url = await getDownloadURL(ref(storage, storagePath));
            return [make, url];
          }
        } catch (error) {
          console.warn(`Failed to resolve logo for ${make}:`, error);
        }
        return [make, undefined];
      })
    )
  );

  // Generate cars for all makes and models
  for (const make of makes) {
    const models = getModelsForMake(make);
    
    // Generate at least one car for each model
    for (const model of models) {
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
        photo: logoUrlByMake[make] || randomData.makeToLogoUrl[make] || "logos/logo.png",
        timestamp: carTimestamp,
      };

      data.push({
        carData,
        ratingsData,
      });
    }
  }
  return data;
}
