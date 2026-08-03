const asyncHandler = require('../Middleware/asyncHandler');
const Property = require('../Models/Property');
const ErrorResponse = require('../Utils/errorResponse');
const { searchProperties, getNearbyProperties, getRecommendedProperties, incrementViews } = require('../Services/propertyService');
const APIFeatures = require('../Utils/apiFeatures');
const crypto = require('crypto');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Property.find({ isPublished: true, $or: [{ verificationStatus: 'published' }, { verificationStatus: { $exists: false } }] }), req.query)
    .filter()
    .search()
    .limitFields()
    .sort()
    .paginate();

  // Category filter – if a category id is provided, limit results
  if (req.query.category) {
    features.query = features.query.where('category').equals(req.query.category);
  }

  // List cards do not need the full property document. Keep descriptions and enrichment data for detail pages.
  features.query = features.query
    .select('title price currency propertyType status bedrooms bathrooms area address images isFeatured views createdAt category')
    .populate('category', 'name slug')
    .lean();

  const [properties, total] = await Promise.all([
    features.query,
    Property.countDocuments({ isPublished: true })
  ]);

  res.status(200).json({
    success: true,
    count: properties.length,
    total,
    data: properties,
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse('Property not found', 404));
  }

  await incrementViews(property._id);

  res.status(200).json({ success: true, data: property });
});

// @desc    Create property
// @route   POST /api/properties
// @access  Private/Agent
exports.createProperty = asyncHandler(async (req, res, next) => {
  req.body.agent = req.user.id;
  req.body.isPublished = req.body.isPublished || true;

  const property = await Property.create(req.body);

  res.status(201).json({ success: true, data: property });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private/Agent
exports.updateProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse('Property not found', 404));
  }

  if (property.agent.toString() !== req.user.id && !['admin', 'super-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to update this property', 403));
  }

  if (req.user.role !== 'super-admin' && property.verificationStatus !== 'draft') {
    property.verificationStatus = 'draft';
    property.isPublished = false;
    await property.save();
  }

  const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updatedProperty });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private/Agent
exports.deleteProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse('Property not found', 404));
  }

  if (property.agent.toString() !== req.user.id && !['admin', 'super-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to delete this property', 403));
  }

  await property.deleteOne();

  res.status(200).json({ success: true, data: {}, message: 'Property deleted successfully' });
});

// @desc    Get my properties
// @route   GET /api/properties/my-properties
// @access  Private/Agent
exports.getMyProperties = asyncHandler(async (req, res, next) => {
  const properties = await Property.find({ agent: req.user.id }).sort('-createdAt');

  res.status(200).json({ success: true, count: properties.length, data: properties });
});

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = asyncHandler(async (req, res, next) => {
  const properties = await Property.find({ isFeatured: true, isPublished: true })
    .limit(10)
    .sort('-views');

  res.status(200).json({ success: true, count: properties.length, data: properties });
});

// @desc    Upload property images
// @route   PUT /api/properties/:id/upload-images
// @access  Private/Agent
exports.uploadPropertyImages = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse('Property not found', 404));
  }

  if (property.agent.toString() !== req.user.id && !['admin', 'super-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to update this property', 403));
  }

  const files = Array.isArray(req.files) ? req.files : ((req.files && req.files.images) || []);
  if (files.length === 0) {
    return next(new ErrorResponse('Please upload at least one image', 400));
  }

  const hashes = new Set((property.imageMetadata || []).map(image => image.sha256).filter(Boolean));
  for (const file of files) {
    if (!file.buffer || file.size === 0) return next(new ErrorResponse('Blank image rejected', 400));
    if ((file.originalname || '').toLowerCase().match(/placeholder|screenshot|stock/)) return next(new ErrorResponse('Placeholder or screenshot image rejected', 400));
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    if (hashes.has(hash)) return next(new ErrorResponse('Duplicate image rejected', 400));
    hashes.add(hash);
  }
  const uploadedImages = files.map(file => ({
    url: file.path,
    publicId: file.filename,
    isFeatured: false,
  }));

  if (property.images.length === 0) {
    uploadedImages[0].isFeatured = true;
  }

  property.images.push(...uploadedImages);
  property.imageMetadata.push(...files.map(file => ({ sha256: crypto.createHash('sha256').update(file.buffer).digest('hex'), size: file.size, mimeType: file.mimetype })));
  await property.save();

  res.status(200).json({ success: true, data: property.images });
});

// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private/Agent
exports.deletePropertyImage = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse('Property not found', 404));
  }

  if (property.agent.toString() !== req.user.id && !['admin', 'super-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to update this property', 403));
  }

  const imageIndex = property.images.findIndex(img => img._id.toString() === req.params.imageId);
  if (imageIndex === -1) {
    return next(new ErrorResponse('Image not found', 404));
  }

  property.images.splice(imageIndex, 1);
  await property.save();

  res.status(200).json({ success: true, data: property.images });
});

// @desc    Toggle featured property
// @route   PUT /api/properties/:id/toggle-featured
// @access  Private/Admin
exports.toggleFeatured = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse('Property not found', 404));
  }

  property.isFeatured = !property.isFeatured;
  await property.save();

  res.status(200).json({
    success: true,
    message: `Property ${property.isFeatured ? 'marked as featured' : 'removed from featured'}`,
  });
});