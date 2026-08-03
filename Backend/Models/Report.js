const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  property: { type: mongoose.Schema.ObjectId, ref: 'Property', index: true },
  targetUser: { type: mongoose.Schema.ObjectId, ref: 'User', index: true },
  reason: { type: String, enum: ['fraud', 'scam', 'duplicate', 'incorrect-information', 'offensive-content', 'already-sold-rented', 'fake-images'], required: true },
  description: { type: String, maxlength: 2000 },
  status: { type: String, enum: ['open', 'triaged', 'resolved', 'dismissed'], default: 'open', index: true },
  priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
  reviewedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  resolution: String,
  resolvedAt: Date
}, { timestamps: true });

ReportSchema.index({ status: 1, priority: -1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);