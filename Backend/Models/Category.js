const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    unique: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  image: {
    public_id: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  icon: {
    type: String,
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Category', CategorySchema);