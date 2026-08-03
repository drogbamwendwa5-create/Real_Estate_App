/**
 * Property Search History Model
 * Tracks user search queries for recommendations and analytics.
 */
const mongoose = require('mongoose');

const PropertySearchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: { type: String, index: true },
    query: { type: String, trim: true },
    filters: {
      county: { type: String },
      town: { type: String },
      estate: { type: String },
      propertyType: { type: String },
      listingType: { type: String },
      minPrice: { type: Number },
      maxPrice: { type: Number },
      bedrooms: { type: Number },
      bathrooms: { type: Number },
      furnished: { type: Boolean },
      serviced: { type: Boolean },
    },
    resultsCount: { type: Number, default: 0 },
    clickedPropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AggregatedProperty',
    },
  },
  { timestamps: true }
);

PropertySearchHistorySchema.index({ userId: 1, createdAt: -1 });
PropertySearchHistorySchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('PropertySearchHistory', PropertySearchHistorySchema);