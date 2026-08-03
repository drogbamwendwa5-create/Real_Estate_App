/**
 * Property Aggregation System - Ranking Configuration
 *
 * Weights and parameters for the property ranking algorithm.
 * Scores range from 1 to 100.
 */
module.exports = {
  // Ranking factor weights (must sum to 100)
  weights: {
    freshness: 15,          // How recently the listing was posted/updated
    images: 10,             // Number and quality of images
    location: 10,           // Location completeness and accuracy
    verification: 15,       // Verification status
    popularity: 10,         // View count
    savedCount: 10,         // Save/favourite count
    descriptionCompleteness: 8, // Description quality and length
    propertyCompleteness: 10,   // Overall metadata completeness
    developerStatus: 7,     // Whether listed by a verified developer
    amenities: 5,           // Number of amenities listed
  },

  // Freshness scoring (days since last update)
  freshness: {
    freshDays: 7,           // Full points if updated within 7 days
    staleDays: 90,          // Zero points if older than 90 days
  },

  // Image scoring
  images: {
    optimalCount: 10,       // Full points for 10+ images
    minCount: 1,            // Minimum for partial score
  },

  // Popularity scoring (views)
  popularity: {
    highViews: 1000,        // Full points for 1000+ views
    lowViews: 10,           // Zero points below 10 views
  },

  // Saved count scoring
  savedCount: {
    highSaves: 100,         // Full points for 100+ saves
    lowSaves: 1,            // Zero points below 1 save
  },

  // Description scoring
  description: {
    optimalLength: 500,     // Full points for 500+ chars
    minLength: 50,          // Minimum for partial score
  },

  // Completeness scoring - fields checked
  completenessFields: [
    'title',
    'description',
    'price',
    'propertyType',
    'listingType',
    'county',
    'town',
    'estate',
    'latitude',
    'longitude',
    'bedrooms',
    'bathrooms',
    'size',
    'agentName',
    'amenities',
    'images',
  ],

  // Amenities scoring
  amenities: {
    optimalCount: 10,       // Full points for 10+ amenities
    minCount: 1,            // Minimum for partial score
  },

  // Score bounds
  minScore: 1,
  maxScore: 100,

  // Featured threshold (properties above this score can be featured)
  featuredThreshold: 75,

  // Verified threshold
  verifiedThreshold: 70,
};