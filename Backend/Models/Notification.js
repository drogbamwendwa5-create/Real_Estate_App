const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['message', 'property', 'review', 'system', 'subscription'],
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);