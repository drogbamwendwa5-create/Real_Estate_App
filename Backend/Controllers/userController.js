const asyncHandler = require('../Middleware/asyncHandler');
const User = require('../Models/User');
const ErrorResponse = require('../Utils/errorResponse');
const APIFeatures = require('../Utils/apiFeatures');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query).filter().sort().paginate().limitFields();
  const users = await features.query;
  const total = await User.countDocuments();

  res.status(200).json({ success: true, count: users.length, total, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.status(200).json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  await user.deleteOne();
  res.status(200).json({ success: true, data: {}, message: 'User deleted' });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorResponse('User not found', 404));

  const { name, email, phone } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;

  await user.save();
  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'Account deleted successfully' });
});

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (req.files && req.files.length > 0) {
    user.avatar = {
      url: req.files[0].path,
      publicId: req.files[0].filename,
    };
    await user.save();
  }

  res.status(200).json({ success: true, data: user.avatar });
});
