const { uploadStream } = require('../Services/cloudinaryService');
const asyncHandler = require('../Middleware/asyncHandler');
const User = require('../Models/User');
const ErrorResponse = require('../Utils/errorResponse');
const APIFeatures = require('../Utils/apiFeatures');
const { assertRoleChangeAllowed, canonicalRole } = require('../Services/rbacService');
const { isSuperAdmin, requireProtectedSuperAdminPin } = require('../Utils/superAdminGuard');
const { recordAudit } = require('../Services/auditService');

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
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  const allowed = ['role', 'isActive', 'suspendedAt', 'overridePin'];
  const unexpected = Object.keys(req.body).filter(key => !allowed.includes(key));
  if (unexpected.length) return next(new ErrorResponse('Unsupported user fields: ' + unexpected.join(', '), 400));
  if (isSuperAdmin(user) && Object.keys(req.body).length > 0) {
    try { await requireProtectedSuperAdminPin(req.user, user, req.body.overridePin || req.get('x-super-admin-break-glass-pin')); } catch (error) { return next(new ErrorResponse(error.message, 403)); }
  }
  if (req.body.role) {
    try { assertRoleChangeAllowed(req.user, req.body.role, user.role); } catch (error) { return next(new ErrorResponse(error.message, 403)); }
    user.role = req.body.role;
  }
  if (req.body.isActive !== undefined) user.isActive = Boolean(req.body.isActive);
  if (req.body.suspendedAt !== undefined) user.suspendedAt = req.body.suspendedAt || undefined;
  await user.save();
  await recordAudit(req, 'user.admin.updated', 'User', user._id, { changedFields: Object.keys(req.body) });
  res.status(200).json({ success: true, data: user });
});
// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (isSuperAdmin(user)) { try { await requireProtectedSuperAdminPin(req.user, user, req.body?.overridePin || req.get('x-super-admin-break-glass-pin')); } catch (error) { return next(new ErrorResponse(error.message, 403)); } }
  await user.deleteOne();
  res.status(200).json({ success: true, data: {}, message: 'User deleted' });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorResponse('User not found', 404));

  const { name, email, phone, profile } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (profile && typeof profile === 'object') Object.assign(user.profile, profile);

  await user.save();
  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (isSuperAdmin(user)) { try { await requireProtectedSuperAdminPin(req.user, user, req.body?.overridePin || req.get('x-super-admin-break-glass-pin')); } catch (error) { return next(new ErrorResponse(error.message, 403)); } }
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'Account deleted successfully' });
});

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (!req.file) return next(new ErrorResponse('Please upload an image', 400));

  const uploadedAvatar = await uploadStream(req.file.buffer, 'real-estate/avatars');
  user.avatar = { url: uploadedAvatar.url, public_id: uploadedAvatar.publicId };
  await user.save();

  res.status(200).json({ success: true, data: user.avatar });
});
