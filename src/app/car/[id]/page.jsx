import Car from "@/src/components/Car.jsx";
import { Suspense } from "react";
import { getCarById } from "@/src/lib/firebase/firestore.js";
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
import ReviewsList, {
  ReviewsListSkeleton,
} from "@/src/components/Reviews/ReviewsList";
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Reviews/ReviewSummary";
import { getFirestore } from "firebase/firestore";
import ReviewerGallery from "@/src/components/Reviews/ReviewerGallery";

export default async function Home(props) {
  // This is a server component, we can access URL
  // parameters via Next.js and download the data
  // we need for this page
  const params = await props.params;
  const { currentUser } = await getUser();
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const car = await getCarById(
    getFirestore(firebaseServerApp),
    params.id
  );

  return (
    <main className="main__car">
      <Car
        id={params.id}
        initialCar={car}
        initialUserId={currentUser?.uid || ""}
      >
        <Suspense fallback={<GeminiSummarySkeleton />}>
          <GeminiSummary carId={params.id} />
        </Suspense>
      </Car>
      <Suspense
        fallback={<ReviewsListSkeleton numReviews={car.numRatings} />}
      >
        <ReviewsList carId={params.id} userId={currentUser?.uid || ""} />
      </Suspense>
      <Suspense fallback={null}>
        <ReviewerGallery carId={params.id} />
      </Suspense>
    </main>
  );
}

