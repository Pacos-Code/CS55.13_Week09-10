import { getReviewsByCarId } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";

export default async function ReviewerGallery({ carId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const reviews = await getReviewsByCarId(getFirestore(firebaseServerApp), carId);

  const imageUrls = Array.from(
    new Set(
      (reviews || [])
        .map((r) => r.photoUrl)
        .filter((url) => typeof url === "string" && url.length > 0)
    )
  );

  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <section className="reviewer-gallery">
      <h2>Reviewer Uploaded Cars</h2>
      <div className="reviewer-gallery__grid">
        {imageUrls.map((src, i) => (
          <div className="reviewer-gallery__item" key={src + i}>
            <img className="reviewer-gallery__img" src={src} alt={`Reviewer photo ${i + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}


