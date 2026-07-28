const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        maxListings: 0,
        featuredListings: 0,
        imageUploads: 0,
        virtualTours: false,
        analytics: false,
      },
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', SubscriptionSchema);