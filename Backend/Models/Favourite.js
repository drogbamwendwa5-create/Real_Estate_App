const mongoose = require('mongoose');

const FavouriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    default: null,
  },
  aggregatedProperty: {
    type: mongoose.Schema.ObjectId,
    ref: 'AggregatedProperty',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FavouriteSchema.index({ user: 1, property: 1 }, { unique: true, sparse: true });
FavouriteSchema.index({ user: 1, aggregatedProperty: 1 }, { unique: true, sparse: true });

FavouriteSchema.pre('save', function (next) {
  if (!this.property && !this.aggregatedProperty) {
    next(new Error('Either property or aggregatedProperty must be provided'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Favourite', FavouriteSchema);
