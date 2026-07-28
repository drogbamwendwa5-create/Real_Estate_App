const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'land', 'commercial'],
      required: [true, 'Please select property type'],
    },
    status: {
      type: String,
      enum: ['for-sale', 'for-rent', 'sold', 'rented'],
      default: 'for-sale',
    },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { type: Number, default: 0 },
    lotSize: { type: Number, default: 0 },
    yearBuilt: { type: Number },
    address: {
      street: { type: String },
      city: { type: String, required: [true, 'Please add a city'] },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, default: 'US' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        isFeatured: { type: Boolean, default: false },
      },
    ],
    features: [String],
    amenities: [String],
    nearbyPlaces: [
      {
        name: String,
        type: String,
        distance: Number,
      },
    ],
    videos: [String],
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    agent: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PropertySchema.index({ title: 'text', description: 'text' });
PropertySchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('Property', PropertySchema);