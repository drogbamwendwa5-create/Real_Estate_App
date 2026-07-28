const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  permissions: [
    {
      type: String,
      enum: [
        'manage_users',
        'manage_properties',
        'manage_reviews',
        'manage_categories',
        'manage_subscriptions',
        'view_reports',
        'manage_settings',
      ],
    },
  ],
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'moderator'],
    default: 'admin',
  },
  lastLogin: {
    type: Date,
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

module.exports = mongoose.model('Admin', AdminSchema);