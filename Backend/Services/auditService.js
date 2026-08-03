const AuditLog = require('../Models/AuditLog');

const recordAudit = async (req, action, entityType, entityId, metadata) => {
  try {
    return await AuditLog.create({
      actor: req && req.user ? req.user._id : undefined,
      action,
      entityType,
      entityId,
      metadata,
      ip: req && req.ip,
      userAgent: req && req.get ? req.get('user-agent') : undefined
    });
  } catch (error) {
    console.error('[Audit] Failed to write audit event:', error.message);
    return null;
  }
};

module.exports = { recordAudit };