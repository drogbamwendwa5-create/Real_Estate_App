const asyncHandler = require('../Middleware/asyncHandler');
const Category = require('../Models/Category');
const ErrorResponse = require('../Utils/errorResponse');
const APIFeatures = require('../Utils/apiFeatures');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Category.find(), req.query).filter().sort().paginate();
  const categories = await features.query;
  const total = await Category.countDocuments();

  res.status(200).json({ success: true, count: categories.length, total, data: categories });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorResponse('Category not found', 404));
  res.status(200).json({ success: true, data: category });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return next(new ErrorResponse('Category not found', 404));
  res.status(200).json({ success: true, data: category });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorResponse('Category not found', 404));
  await category.deleteOne();
  res.status(200).json({ success: true, data: {}, message: 'Category deleted' });
});