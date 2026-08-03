const mongoose = require('mongoose');

const EncryptedDocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true, max: 10 * 1024 * 1024 },
  iv: { type: String, required: true, select: false },
  authTag: { type: String, required: true, select: false },
  ciphertext: { type: Buffer, required: true, select: false },
  sha256: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: true });

const VerificationRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', index: true },
  property: { type: mongoose.Schema.ObjectId, ref: 'Property', index: true },
  type: { type: String, enum: ['professional', 'ownership', 'listing'], required: true, index: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending', index: true },
  documents: [EncryptedDocumentSchema],
  checks: { type: mongoose.Schema.Types.Mixed, default: {} },
  notes: String,
  reviewedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  reviewedAt: Date,
  expiresAt: Date
}, { timestamps: true });

VerificationRequestSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('VerificationRequest', VerificationRequestSchema);