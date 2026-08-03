const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../Middleware/auth');
const AuditLog = require('../Models/AuditLog');

router.get('/', protect, requirePermission('view-audit-logs'), async (req, res, next) => {
  try {
    const query = {};
    if (req.query.action) query.action = req.query.action;
    const logs = await AuditLog.find(query).populate('actor', 'name email role').sort('-createdAt').limit(Math.min(Number(req.query.limit) || 100, 500));
    res.json({ success: true, count: logs.length, data: logs });
  } catch (e) { next(e); }
});
module.exports = router;