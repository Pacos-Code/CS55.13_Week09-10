// Random car data that is added to Firestore
// After you've signed into Auto Reviews, click the dropdown
// menu in the top right corner and select "Add sample cars"

export const randomData = {
  // Car makes with their corresponding models (reduced to 5 makes)
  carMakeModels: {
    "BMW": ["3 Series", "5 Series", "X5", "X3", "X7", "M3", "M5", "7 Series"],
    "Ford": ["F-150", "Explorer", "Edge", "Mustang", "Escape", "Bronco", "Ranger", "Expedition"],
    "Mazda": ["CX-5", "Mazda3", "CX-9", "CX-50", "MX-5", "Mazda6", "CX-30", "CX-3"],
    "Porsche": ["911", "Cayenne", "Macan", "Panamera", "Boxster", "Cayman", "Taycan"],
    "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Prius", "4Runner", "Tacoma", "Tundra"]
  },
  
  carTypes: [
    "Sedan",
    "SUV",
    "Truck",
    "Sports Car",
    "Coupe",
    "Hatchback",
    "Minivan",
    "Crossover",
    "Convertible",
    "Wagon"
  ],
  
  // Car make to country mapping (reduced to 5 makes)
  makeToCountry: {
    "BMW": "Germany",
    "Ford": "USA",
    "Mazda": "Japan",
    "Porsche": "Germany",
    "Toyota": "Japan"
  },
  
  // Car make to Firebase Storage logo URL mapping
  // IMPORTANT: After uploading logo images to Firebase Storage at paths like "logos/bmw.png",
  // you need to get the download URLs from Firebase Console and replace these paths with
  // full URLs. Example: "https://firebasestorage.googleapis.com/v0/b/YOUR-BUCKET/o/logos%2Fbmw.png?alt=media&token=..."
  // Or you can use getDownloadURL() from Firebase Storage SDK to generate these URLs programmatically.
  makeToLogoUrl: {
    "BMW": "logos/bmw.png",
    "Ford": "logos/ford.png",
    "Mazda": "logos/mazda.png",
    "Porsche": "logos/porsche.png",
    "Toyota": "logos/toyota.png"
  },
  
  carReviews: [
    { text: "Excellent fuel economy and extremely reliable. Great daily driver!", rating: 5 },
    { text: "Love the performance and handling. Perfect for my commute.", rating: 5 },
    { text: "Very comfortable ride and spacious interior. Family loves it!", rating: 5 },
    { text: "Outstanding reliability, no major issues after 3 years.", rating: 5 },
    { text: "Great value for the money. Modern features and good resale value.", rating: 5 },
    { text: "Smooth ride and excellent build quality. Highly recommend!", rating: 5 },
    { text: "Fuel efficient and low maintenance costs. Perfect city car.", rating: 5 },
    { text: "Impressive safety features and technology. Peace of mind.", rating: 5 },
    { text: "Good overall car, comfortable and efficient.", rating: 4 },
    { text: "Solid vehicle with decent features for the price.", rating: 4 },
    { text: "Enjoy driving it daily, reliable and functional.", rating: 4 },
    { text: "Good value, though interior could be nicer.", rating: 4 },
    { text: "Works well for my needs, nothing special though.", rating: 4 },
    { text: "Average reliability and comfort. Gets the job done.", rating: 3 },
    { text: "Okay car, but lacks some modern conveniences.", rating: 3 },
    { text: "Decent performance, but fuel economy could be better.", rating: 3 },
    { text: "Had some mechanical issues, reliability concerns.", rating: 2 },
    { text: "Higher maintenance costs than expected.", rating: 2 },
    { text: "Disappointing build quality for the price.", rating: 2 },
    { text: "Frequent repairs needed. Very unreliable.", rating: 2 },
    { text: "Poor fuel economy and constant problems. Avoid this model.", rating: 1 },
    { text: "Lemon from day one. Spent more time in shop than on road.", rating: 1 },
    { text: "Uncomfortable and unreliable. Worst car I've owned.", rating: 1 },
    { text: "Terrible value, regret the purchase completely.", rating: 1 },
    { text: "Absolutely amazing! Best car purchase I've made.", rating: 5 },
    { text: "Exceeds expectations in every way. Pure joy to drive.", rating: 5 },
    { text: "Top-notch quality and amazing performance. Worth every penny!", rating: 5 },
    { text: "Highly recommended for anyone car shopping. Excellent choice.", rating: 5 },
    { text: "Fantastic features and unbeatable reliability. Love it!", rating: 5 },
    { text: "Perfect for long trips. Comfortable and efficient.", rating: 5 },
    { text: "Impressive technology and smooth ride quality.", rating: 5 },
    { text: "Great balance of comfort, performance, and efficiency.", rating: 5 },
    { text: "Very satisfied overall. Few minor complaints but solid car.", rating: 4 },
    { text: "Nice interior and good fuel economy. Drives well.", rating: 4 },
    { text: "Pleasantly surprised by the quality and features.", rating: 4 },
    { text: "Good build quality and comfortable seats.", rating: 4 },
    { text: "Meets expectations without exceeding them.", rating: 4 },
    { text: "Average car, nothing stands out as exceptional.", rating: 3 },
    { text: "Fairly reliable but could use better amenities.", rating: 3 },
    { text: "Okay for basic transportation needs.", rating: 3 },
    { text: "Not impressed with the quality for this price range.", rating: 2 },
    { text: "Subpar reliability and higher than expected costs.", rating: 2 },
    { text: "Uncomfortable ride and poor build quality.", rating: 2 },
    { text: "Major disappointment. Not worth the investment.", rating: 2 }
  ],
};

// Helper function to get all makes
export function getAllMakes() {
  return Object.keys(randomData.carMakeModels);
}

// Helper function to get models for a specific make
export function getModelsForMake(make) {
  return randomData.carMakeModels[make] || [];
}
