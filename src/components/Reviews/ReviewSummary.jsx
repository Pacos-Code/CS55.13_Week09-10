import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";
import { getReviewsByCarId } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";

/**
 * GeminiSummary fetches reviews for a car and generates a concise
 * one-sentence summary using Google Genkit with the Gemini model.
 * Falls back to an error message if summarization fails.
 *
 * @param {{ carId: string }} props - Contains the car ID.
 * @returns {Promise<JSX.Element>} Summary block or error paragraph.
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
/**
 * GeminiSummarySkeleton renders a lightweight placeholder while the
 * summary is being generated server-side.
 *
 * @returns {JSX.Element}
 */
export function GeminiSummarySkeleton() {
  return (
    <div className="car__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
