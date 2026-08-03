/**
 * Property Ranking Model
 * Stores ranking scores and breakdown for aggregated properties.
 */
const mongoose = require('mongoose');

const PropertyRankingSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AggregatedProperty',
      required: true,
      unique: true,
      index: true,
    },
    totalScore: { type: Number, required: true, min: 1, max: 100, index: true },
    scores: {
      freshness: { type: Number, default: 0 },
      images: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      verification: { type: Number, default: 0 },
      popularity: { type: Number, default: 0 },
      savedCount: { type: Number, default: 0 },
      descriptionCompleteness: { type: Number, default: 0 },
      propertyCompleteness: { type: Number, default: 0 },
      developerStatus: { type: Number, default: 0 },
      amenities: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    lastCalculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PropertyRanking', PropertyRankingSchema);