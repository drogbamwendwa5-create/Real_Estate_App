const asyncHandler = require('../Middleware/asyncHandler');
const ErrorResponse = require('../Utils/errorResponse');
const Report = require('../Models/Report');
const Property = require('../Models/Property');
const { recordAudit } = require('../Services/auditService');

const createReport = asyncHandler(async (req, res, next) => {
  if (!req.body.propertyId && !req.body.targetUserId) return next(new ErrorResponse('A property or user is required', 400));
  if (req.body.propertyId && !(await Property.exists({ _id: req.body.propertyId }))) return next(new ErrorResponse('Property not found', 404));
  const report = await Report.create({
    reporter: req.user._id,
    property: req.body.propertyId,
    targetUser: req.body.targetUserId,
    reason: req.body.reason,
    description: req.body.description,
    priority: req.body.reason === 'fraud' || req.body.reason === 'scam' ? 'high' : 'normal'
  });
  await recordAudit(req, 'report.created', 'Report', report._id, { reason: report.reason });
  res.status(201).json({ success: true, data: report });
});

const listReports = asyncHandler(async (req, res) => {
  const query = req.query.status ? { status: req.query.status } : {};
  const reports = await Report.find(query).populate('reporter', 'name email').populate('property', 'title agent').populate('targetUser', 'name email').sort({ priority: -1, createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 50, 100));
  res.json({ success: true, count: reports.length, data: reports });
});

const updateReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id);
  if (!report) return next(new ErrorResponse('Report not found', 404));
  if (!['triaged', 'resolved', 'dismissed'].includes(req.body.status)) return next(new ErrorResponse('Invalid report status', 400));
  report.status = req.body.status;
  report.resolution = req.body.resolution;
  report.reviewedBy = req.user._id;
  report.resolvedAt = new Date();
  await report.save();
  await recordAudit(req, 'report.updated', 'Report', report._id, { status: report.status });
  res.json({ success: true, data: report });
});

module.exports = { createReport, listReports, updateReport };