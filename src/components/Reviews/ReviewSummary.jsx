import React from "react";

/**
 * Temporary stub: Gemini summary disabled to avoid requiring GEMINI_API_KEY in hosting.
 * Keeps the same API so the rest of the app works unchanged.
 */
export async function GeminiSummary({ carId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const reviews = await getReviewsByCarId(
    getFirestore(firebaseServerApp),
    carId
  );

  const reviewSeparator = "@";
  const prompt = `
    Based on the following car reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the car. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://firebase.google.com/docs/genkit/get-started
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance.
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash, // set default model
    });
    const { text } = await ai.generate(prompt);

    return (
      <div className="car__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    console.error(e);
    return <p>Error summarizing reviews.</p>;
  }
}