const asyncHandler = require('../Middleware/asyncHandler');
const ErrorResponse = require('../Utils/errorResponse');
const User = require('../Models/User');
const RefreshToken = require('../Models/RefreshToken');
const LoginHistory = require('../Models/LoginHistory');
const crypto = require('crypto');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../Services/emailService');
const { recordAudit } = require('../Services/auditService');
const { isSuperAdmin, verifyBreakGlassPin } = require('../Utils/superAdminGuard');
const { setAuthCookies, clearAuthCookies } = require('../Utils/cookies');

const issueRefreshToken = async (user, req) => {
  try {
    const raw = crypto.randomBytes(48).toString('hex');
    await RefreshToken.create({
      user: user._id,
      tokenHash: crypto.createHash('sha256').update(raw).digest('hex'),
      userAgent: req?.get ? req.get('user-agent') : req?.headers?.['user-agent'],
      ip: req?.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    return raw;
  } catch (err) {
    console.error('[Auth] Failed to issue refresh token:', err.message);
    return null;
  }
};

const refresh = asyncHandler(async (req, res, next) => {
  const raw = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);
  if (!raw) return next(new ErrorResponse('Refresh token is required', 401));
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const stored = await RefreshToken.findOne({ tokenHash, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } }).populate('user');
  if (!stored || !stored.user || !stored.user.isActive) return next(new ErrorResponse('Invalid refresh token', 401));
  stored.revokedAt = new Date();
  await stored.save();
  const newAccess = stored.user.generateJWT();
  const newRefresh = await issueRefreshToken(stored.user, req);
  setAuthCookies(res, newAccess, newRefresh);
  res.json({ success: true, token: newAccess, refreshToken: newRefresh });
});

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (await User.findOne({ email: normalizedEmail })) return next(new ErrorResponse('User already exists with this email', 400));
  const user = await User.create({ name: (name || '').trim(), email: normalizedEmail, password, phone, canonicalRole: 'buyer-tenant', verificationToken: crypto.randomBytes(20).toString('hex') });
  try {
    sendWelcomeEmail(user);
  } catch (emailErr) {
    console.warn('[Auth] Welcome email skipped:', emailErr.message);
  }
  const token = user.generateJWT();
  const refreshToken = await issueRefreshToken(user, req);
  await recordAudit(req, 'auth.registered', 'User', user._id);
  setAuthCookies(res, token, refreshToken);
  res.status(201).json({ success: true, token, refreshToken, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, canonicalRole: user.canonicalRole, isVerified: user.isVerified } });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, breakGlassPin } = req.body;
  if (!email || !password) return next(new ErrorResponse('Please provide email and password', 400));

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    try {
      await LoginHistory.create({ email: normalizedEmail, success: false, ip: req.ip, userAgent: req?.get ? req.get('user-agent') : undefined, reason: 'unknown-user' });
    } catch (logErr) {
      console.warn('[Auth] LoginHistory error:', logErr.message);
    }
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    try {
      await LoginHistory.create({ user: user._id, email: normalizedEmail, success: false, ip: req.ip, userAgent: req?.get ? req.get('user-agent') : undefined, reason: 'invalid-password' });
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;
      await user.save({ validateBeforeSave: false });
    } catch (logErr) {
      console.warn('[Auth] Failed login history error:', logErr.message);
    }
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  if ((!user.isActive || user.suspendedAt) && !(isSuperAdmin(user) && await verifyBreakGlassPin(breakGlassPin))) {
    return next(new ErrorResponse('Account is inactive or suspended. A valid Super Admin recovery PIN is required.', 403));
  }

  if (isSuperAdmin(user) && breakGlassPin && await verifyBreakGlassPin(breakGlassPin)) {
    user.isActive = true;
    user.suspendedAt = undefined;
  }

  try {
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastSeenAt = new Date();
    await user.save({ validateBeforeSave: false });
  } catch (saveErr) {
    console.warn('[Auth] User metadata save warning:', saveErr.message);
  }

  try {
    await LoginHistory.create({ user: user._id, email: normalizedEmail, success: true, ip: req.ip, userAgent: req?.get ? req.get('user-agent') : undefined });
  } catch (logErr) {
    console.warn('[Auth] LoginHistory success record warning:', logErr.message);
  }

  const token = user.generateJWT();
  const refreshToken = await issueRefreshToken(user, req);
  await recordAudit(req, 'auth.login.success', 'User', user._id);
  setAuthCookies(res, token, refreshToken);

  res.status(200).json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      canonicalRole: user.canonicalRole,
      isVerified: user.isVerified,
      avatar: user.avatar,
    },
  });
});

exports.refresh = refresh;

exports.logout = asyncHandler(async (req, res) => {
  const raw = req.body && req.body.refreshToken;
  if (raw) await RefreshToken.findOneAndUpdate({ tokenHash: crypto.createHash('sha256').update(raw).digest('hex') }, { revokedAt: new Date() });
  await recordAudit(req, 'auth.logout', 'User', req.user && req.user._id);
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Audit the look-up even when no user matches so failed lookups are reviewable.
    await recordAudit(req, 'auth.forgot_password.no_user', 'User', undefined, { email: (req.body.email || '').toLowerCase() });
    return next(new ErrorResponse('No user found with that email', 404));
  }
  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });
  sendPasswordResetEmail(user, resetToken);
  await recordAudit(req, 'auth.forgot_password.sent', 'User', user._id);
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
  await recordAudit(req, 'auth.password.reset', 'User', user._id);
  const token = user.generateJWT();
  const refreshToken = await issueRefreshToken(user, req);
  setAuthCookies(res, token, refreshToken);
  res.status(200).json({ success: true, token, refreshToken, message: 'Password reset successful' });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (!(await user.comparePassword(req.body.currentPassword))) return next(new ErrorResponse('Current password is incorrect', 400));
  user.password = req.body.newPassword;
  await user.save();
  const token = user.generateJWT();
  await recordAudit(req, 'auth.password.updated', 'User', user._id);
  setAuthCookies(res, token);
  res.status(200).json({ success: true, message: 'Password updated successfully', token });
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ verificationToken: req.params.token });
  if (!user) return next(new ErrorResponse('Invalid or expired verification token', 400));
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  await recordAudit(req, 'auth.email.verified', 'User', user._id);
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
  await recordAudit(req, 'auth.account.deleted', 'User', user._id);
  clearAuthCookies(res);
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