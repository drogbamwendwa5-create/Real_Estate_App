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
      default: 'KES',
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'land', 'commercial'],
      required: [true, 'Please select property type'],
    },
    // Category reference for property classification
    category: { type: mongoose.Schema.ObjectId, ref: 'Category' },
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
      country: { type: String, default: 'Kenya' },
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
    verificationStatus: {
      type: String,
      enum: ['draft', 'submitted', 'automated-validation', 'fraud-detection', 'duplicate-detection', 'document-verification', 'location-verification', 'image-verification', 'moderator-review', 'approved', 'published', 'rejected', 'archived'],
      default: 'draft',
      index: true,
    },
    verification: {
      submittedAt: Date,
      automatedAt: Date,
      reviewedAt: Date,
      reviewedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
      rejectionReason: String,
      checks: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    ownershipDocuments: [{ type: mongoose.Schema.ObjectId, ref: 'VerificationRequest' }],
    fraudFlags: [{ type: String }],
    duplicateScore: { type: Number, min: 0, max: 100, default: 0 },
    imageMetadata: [{
      sha256: String,
      width: Number,
      height: Number,
      size: Number,
      mimeType: String,
      thumbnailUrl: String,
    }],
    locationVerification: {
      status: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
      reverseGeocoded: mongoose.Schema.Types.Mixed,
      checkedAt: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    // === Geospatial Enrichment Fields (added by OSM services) ===
    nearbyAmenities: {
      schools: [{ name: String, distance: Number, lat: Number, lng: Number }],
      hospitals: [{ name: String, distance: Number, lat: Number, lng: Number }],
      universities: [{ name: String, distance: Number, lat: Number, lng: Number }],
      banks: [{ name: String, distance: Number, lat: Number, lng: Number }],
      shopping: [{ name: String, distance: Number, lat: Number, lng: Number }],
      policeStations: [{ name: String, distance: Number, lat: Number, lng: Number }],
      restaurants: [{ name: String, distance: Number, lat: Number, lng: Number }],
      pharmacies: [{ name: String, distance: Number, lat: Number, lng: Number }],
      petrolStations: [{ name: String, distance: Number, lat: Number, lng: Number }],
    },
    investmentScore: {
      overall: { type: Number, min: 0, max: 100 },
      rentalYield: { type: Number },
      amenityScore: { type: Number, min: 0, max: 100 },
      locationScore: { type: Number, min: 0, max: 100 },
      marketDemand: { type: Number, min: 0, max: 100 },
      infrastructureScore: { type: Number, min: 0, max: 100 },
      calculatedAt: { type: Date },
    },
    propertyBoundary: {
      type: {
        type: String,
        enum: ['Polygon'],
      },
      coordinates: {
        type: [[[Number]]],
      },
    },
  },
  {
    timestamps: true,
  }
);

PropertySchema.index({ title: 'text', description: 'text' });
PropertySchema.index({ agent: 1, verificationStatus: 1, createdAt: -1 });
PropertySchema.index({ isPublished: 1, verificationStatus: 1, createdAt: -1 });
PropertySchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('Property', PropertySchema);