const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', index: true },
  email: String,
  success: { type: Boolean, required: true },
  ip: String,
  userAgent: String,
  reason: String,
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('LoginHistory', LoginHistorySchema);