const asyncHandler = require('../Middleware/asyncHandler');
const Property = require('../Models/Property');
const ErrorResponse = require('../Utils/errorResponse');
const { searchProperties, getNearbyProperties, getRecommendedProperties, incrementViews } = require('../Services/propertyService');
const APIFeatures = require('../Utils/apiFeatures');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Property.find({ isPublished: true }), req.query)
    .filter()
    .search()
    .limitFields()
    .sort()
    .paginate();

  const properties = await features.query;
  const total = await Property.countDocuments({ isPublished: true });

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

  if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this property', 403));
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

  if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
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

  if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this property', 403));
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one image', 400));
  }

  const uploadedImages = req.files.map(file => ({
    url: file.path,
    publicId: file.filename,
    isFeatured: false,
  }));

  if (property.images.length === 0) {
    uploadedImages[0].isFeatured = true;
  }

  property.images.push(...uploadedImages);
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

  if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
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