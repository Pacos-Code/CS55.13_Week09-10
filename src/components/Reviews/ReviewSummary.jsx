import React from "react";

/**
 * Temporary stub: Gemini summary disabled to avoid requiring GEMINI_API_KEY in hosting.
 * Keeps the same API so the rest of the app works unchanged.
 */
export async function GeminiSummary({ carId }) {
  // Intentionally do nothing with carId to avoid lint errors
  void carId;
  return (
    <div className="car__review_summary">
      <p>Review summary temporarily disabled.</p>
    </div>
  );
}

/**
 * Skeleton placeholder while summary would be loading; kept for UI consistency.
 */
export function GeminiSummarySkeleton() {
  return (
    <div className="car__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
