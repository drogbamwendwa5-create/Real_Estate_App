const crypto = require('crypto');
const asyncHandler = require('../Middleware/asyncHandler');
const ErrorResponse = require('../Utils/errorResponse');
const User = require('../Models/User');
const Property = require('../Models/Property');
const VerificationRequest = require('../Models/VerificationRequest');
const { encryptBuffer, decryptBuffer } = require('../Services/secureDocumentService');
const { recordAudit } = require('../Services/auditService');

const submitProfessional = asyncHandler(async (req, res, next) => {
  const request = await VerificationRequest.create({ user: req.user._id, type: 'professional', checks: req.body });
  req.user.professionalVerification.status = 'pending';
  await req.user.save();
  await recordAudit(req, 'verification.professional.submitted', 'User', req.user._id);
  res.status(201).json({ success: true, data: request });
});

const submitOwnership = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.body.propertyId);
  if (!property) return next(new ErrorResponse('Property not found', 404));
  if (String(property.agent) !== String(req.user._id)) return next(new ErrorResponse('You do not own this listing', 403));
  if (!req.files || req.files.length === 0) return next(new ErrorResponse('At least one ownership document is required', 400));

  const documents = req.files.map(file => ({
    name: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    ...encryptBuffer(file.buffer)
  }));
  const request = await VerificationRequest.create({ user: req.user._id, property: property._id, type: 'ownership', documents });
  property.ownershipDocuments.push(request._id);
  property.verificationStatus = 'document-verification';
  await property.save();
  await recordAudit(req, 'verification.ownership.submitted', 'Property', property._id, { requestId: request._id, documentCount: documents.length });
  res.status(201).json({ success: true, data: { id: request._id, status: request.status, documentCount: documents.length } });
});

const submitListing = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) return next(new ErrorResponse('Property not found', 404));
  const isOwner = String(property.agent) === String(req.user._id);
  const isSuperAdmin = req.user.role === 'super-admin';
  if (!isOwner && !isSuperAdmin) return next(new ErrorResponse('You do not own this listing', 403));

  property.verificationStatus = isSuperAdmin ? 'published' : 'submitted';
  property.isPublished = isSuperAdmin;
  property.verification = { submittedAt: new Date() };
  await property.save();
  const request = await VerificationRequest.create({ user: property.agent, property: property._id, type: 'listing', status: isSuperAdmin ? 'approved' : 'pending' });
  await recordAudit(req, 'verification.listing.submitted', 'Property', property._id, { requestId: request._id });
  res.status(200).json({ success: true, data: property });
});

const getMyVerification = asyncHandler(async (req, res) => {
  const requests = await VerificationRequest.find({ user: req.user._id }).select('-documents.ciphertext -documents.iv -documents.authTag').sort('-createdAt');
  res.json({ success: true, count: requests.length, data: requests });
});

const listVerification = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.type) query.type = req.query.type;
  if (req.query.status) query.status = req.query.status;
  const requests = await VerificationRequest.find(query).select('-documents.ciphertext -documents.iv -documents.authTag').populate('user', 'name email phone role').populate('property', 'title agent verificationStatus').sort('-createdAt').limit(Math.min(Number(req.query.limit) || 50, 100));
  res.json({ success: true, count: requests.length, data: requests });
});

const reviewVerification = asyncHandler(async (req, res, next) => {
  const request = await VerificationRequest.findById(req.params.id);
  if (!request) return next(new ErrorResponse('Verification request not found', 404));
  const status = req.body.status;
  if (!['approved', 'rejected', 'expired'].includes(status)) return next(new ErrorResponse('Invalid verification status', 400));

  request.status = status;
  request.notes = req.body.notes;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  if (request.type === 'professional') {
    await User.findByIdAndUpdate(request.user, { 'professionalVerification.status': status, ...(status === 'approved' ? { isVerified: true, role: 'agency-professional', canonicalRole: 'agency-professional', 'professionalVerification.verifiedAt': new Date() } : {}) });
  }
  if (request.type === 'ownership') {
    await Property.findByIdAndUpdate(request.property, {
      verificationStatus: status === 'approved' ? 'moderator-review' : 'rejected',
      ...(status === 'rejected' ? { isPublished: false, 'verification.rejectionReason': request.notes } : {})
    });
  }
  if (request.type === 'listing') {
    await Property.findByIdAndUpdate(request.property, {
      verificationStatus: status === 'approved' ? 'published' : 'rejected',
      isPublished: status === 'approved',
      'verification.reviewedAt': new Date(),
      'verification.reviewedBy': req.user._id,
      ...(status === 'rejected' ? { 'verification.rejectionReason': request.notes } : {})
    });
  }
  await recordAudit(req, 'verification.reviewed', 'VerificationRequest', request._id, { status, type: request.type });
  res.json({ success: true, data: request });
});

const downloadDocument = asyncHandler(async (req, res, next) => {
  const request = await VerificationRequest.findById(req.params.id).select('+documents.iv +documents.authTag +documents.ciphertext');
  if (!request) return next(new ErrorResponse('Verification request not found', 404));
  const document = request.documents.id(req.params.documentId);
  if (!document) return next(new ErrorResponse('Document not found', 404));
  await recordAudit(req, 'verification.document.accessed', 'VerificationRequest', request._id, { documentId: document._id });
  const buffer = decryptBuffer(document);
  res.set('Content-Type', document.mimeType);
  res.set('Content-Disposition', 'attachment; filename="' + document.name.replace(/["\\]/g, '') + '"');
  res.send(buffer);
});

module.exports = { submitProfessional, submitOwnership, submitListing, getMyVerification, listVerification, reviewVerification, downloadDocument };