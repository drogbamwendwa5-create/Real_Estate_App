const asyncHandler = require('../Middleware/asyncHandler');
const ErrorResponse = require('../Utils/errorResponse');
const User = require('../Models/User');
const RefreshToken = require('../Models/RefreshToken');
const LoginHistory = require('../Models/LoginHistory');
const crypto = require('crypto');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../Services/emailService');
const { recordAudit } = require('../Services/auditService');
const { isSuperAdmin, verifyBreakGlassPin } = require('../Utils/superAdminGuard');

const issueRefreshToken = async (user, req) => {
  const raw = crypto.randomBytes(48).toString('hex');
  await RefreshToken.create({
    user: user._id,
    tokenHash: crypto.createHash('sha256').update(raw).digest('hex'),
    userAgent: req.get('user-agent'),
    ip: req.ip,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  return raw;
};

const refresh = asyncHandler(async (req, res, next) => {
  const raw = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);
  if (!raw) return next(new ErrorResponse('Refresh token is required', 401));
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const stored = await RefreshToken.findOne({ tokenHash, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } }).populate('user');
  if (!stored || !stored.user || !stored.user.isActive) return next(new ErrorResponse('Invalid refresh token', 401));
  stored.revokedAt = new Date();
  await stored.save();
  res.json({ success: true, token: stored.user.generateJWT(), refreshToken: await issueRefreshToken(stored.user, req) });
});

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  if (await User.findOne({ email })) return next(new ErrorResponse('User already exists with this email', 400));
  const user = await User.create({ name, email, password, phone, canonicalRole: 'buyer-tenant', verificationToken: crypto.randomBytes(20).toString('hex') });
  sendWelcomeEmail(user);
  const token = user.generateJWT();
  const refreshToken = await issueRefreshToken(user, req);
  await recordAudit(req, 'auth.registered', 'User', user._id);
  res.status(201).json({ success: true, token, refreshToken, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, canonicalRole: user.canonicalRole, isVerified: user.isVerified } });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, breakGlassPin } = req.body;
  if (!email || !password) return next(new ErrorResponse('Please provide email and password', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    await LoginHistory.create({ email, success: false, ip: req.ip, userAgent: req.get('user-agent'), reason: 'unknown-user' });
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  if (!(await user.comparePassword(password))) {
    await LoginHistory.create({ user: user._id, email, success: false, ip: req.ip, userAgent: req.get('user-agent'), reason: 'invalid-password' });
    user.failedLoginCount = (user.failedLoginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  if ((!user.isActive || user.suspendedAt) && !(isSuperAdmin(user) && await verifyBreakGlassPin(breakGlassPin))) {
    return next(new ErrorResponse('Account is inactive or suspended. A valid Super Admin recovery PIN is required.', 403));
  }
  if (isSuperAdmin(user) && breakGlassPin && await verifyBreakGlassPin(breakGlassPin)) {
    user.isActive = true;
    user.suspendedAt = undefined;
  }

  user.loginCount = (user.loginCount || 0) + 1;
  user.lastSeenAt = new Date();
  await user.save({ validateBeforeSave: false });
  await LoginHistory.create({ user: user._id, email, success: true, ip: req.ip, userAgent: req.get('user-agent') });
  const token = user.generateJWT();
  const refreshToken = await issueRefreshToken(user, req);
  await recordAudit(req, 'auth.login.success', 'User', user._id);
  res.status(200).json({ success: true, token, refreshToken, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, canonicalRole: user.canonicalRole, isVerified: user.isVerified, avatar: user.avatar } });
});

exports.refresh = refresh;

exports.logout = asyncHandler(async (req, res) => {
  const raw = req.body && req.body.refreshToken;
  if (raw) await RefreshToken.findOneAndUpdate({ tokenHash: crypto.createHash('sha256').update(raw).digest('hex') }, { revokedAt: new Date() });
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorResponse('No user found with that email', 404));
  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });
  sendPasswordResetEmail(user, resetToken);
  res.status(200).json({ success: true, message: 'Password reset email sent' });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) return next(new ErrorResponse('Invalid or expired reset token', 400));
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.status(200).json({ success: true, token: user.generateJWT(), message: 'Password reset successful' });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (!(await user.comparePassword(req.body.currentPassword))) return next(new ErrorResponse('Current password is incorrect', 400));
  user.password = req.body.newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password updated successfully', token: user.generateJWT() });
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ verificationToken: req.params.token });
  if (!user) return next(new ErrorResponse('Invalid or expired verification token', 400));
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  res.status(200).json({ success: true, message: 'Email verified successfully' });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await User.findById(req.user.id) });
});

exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (!(await user.comparePassword(req.body.password))) return next(new ErrorResponse('Password is incorrect', 400));
  user.isActive = false;
  user.email = 'deleted_' + user._id + '@deleted.com';
  user.name = 'Deleted User';
  user.password = crypto.randomBytes(20).toString('hex');
  await user.save();
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Account deleted successfully', data: {} });
});

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;
  if (req.body.phone) user.phone = req.body.phone;
  await user.save();
  res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
});