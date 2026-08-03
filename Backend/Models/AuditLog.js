const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  entityType: { type: String, index: true },
  entityId: mongoose.Schema.ObjectId,
  metadata: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now, index: true }
});

AuditLogSchema.index({ actor: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);