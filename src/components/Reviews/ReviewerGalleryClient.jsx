"use client";

import { useEffect, useState } from "react";
import { getReviewsSnapshotByCarId } from "@/src/lib/firebase/firestore.js";

export default function ReviewerGalleryClient({ carId }) {
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    if (!carId) return;
    const unsubscribe = getReviewsSnapshotByCarId(carId, (reviews) => {
      const urls = Array.from(
        new Set(
          (reviews || [])
            .map((r) => r.photoUrl)
            .filter((url) => typeof url === "string" && url.length > 0)
        )
      );
      setImageUrls(urls);
    });
    return () => unsubscribe && unsubscribe();
  }, [carId]);

  if (!imageUrls.length) return null;

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


