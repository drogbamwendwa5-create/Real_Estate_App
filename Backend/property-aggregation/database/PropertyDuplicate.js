/**
 * Property Duplicate Model
 * Tracks detected duplicate listings and merge history.
 */
const mongoose = require('mongoose');

const PropertyDuplicateSchema = new mongoose.Schema(
  {
    primaryPropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AggregatedProperty',
      required: true,
      index: true,
    },
    duplicatePropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AggregatedProperty',
      required: true,
      index: true,
    },
    similarityScore: { type: Number, required: true, min: 0, max: 100 },
    matchedFields: [{ type: String }],
    isMerged: { type: Boolean, default: false },
    mergedAt: { type: Date },
    detectionMethod: {
      type: String,
      enum: ['title', 'description', 'image', 'location', 'price', 'comprehensive'],
      default: 'comprehensive',
    },
  },
  { timestamps: true }
);

PropertyDuplicateSchema.index({ primaryPropertyId: 1, duplicatePropertyId: 1 }, { unique: true });

module.exports = mongoose.model('PropertyDuplicate', PropertyDuplicateSchema);