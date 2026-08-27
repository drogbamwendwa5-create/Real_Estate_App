const asyncHandler = require('../Middleware/asyncHandler');
const Review = require('../Models/Review');
const Property = require('../Models/Property');
const ErrorResponse = require('../Utils/errorResponse');

// @desc    Get all reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
exports.getPropertyReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ property: req.params.propertyId })
    .populate('user', 'name email avatar')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate('user', 'name email avatar');

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  res.status(200).json({ success: true, data: review });
});

// @desc    Create review
// @route   POST /api/reviews/property/:propertyId
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const property = await Property.findById(req.params.propertyId);

  if (!property) {
    return next(new ErrorResponse('Property not found', 404));
  }

  const existingReview = await Review.findOne({
    property: req.params.propertyId,
    user: req.user.id,
  });

  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this property', 400));
  }

  const review = await Review.create({
    property: req.params.propertyId,
    user: req.user.id,
    rating,
    comment,
  });

  res.status(201).json({ success: true, data: review });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this review', 403));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });

  res.status(200).json({ success: true, data: review });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 403));
  }

  await review.deleteOne();

  res.status(200).json({ success: true, data: {}, message: 'Review deleted successfully' });
});