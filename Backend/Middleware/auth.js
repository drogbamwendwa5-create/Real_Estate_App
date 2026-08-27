const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const ErrorResponse = require('../Utils/errorResponse');
const asyncHandler = require('./asyncHandler');
const { userHasPermission, canonicalRole } = require('../Services/rbacService');
const { isSuperAdmin, verifyBreakGlassPin } = require('../Utils/superAdminGuard');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) return next(new ErrorResponse('Not authorized to access this route', 401));

  try {
    const secret = process.env.JWT_SECRET || 'real_estate_jwt_secret_production_fallback_key_2026';
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id);
    if (!req.user) return next(new ErrorResponse('User not found', 401));
    const breakGlassApproved = isSuperAdmin(req.user) && await verifyBreakGlassPin(req.get('x-super-admin-break-glass-pin'));
    if ((!req.user.isActive || req.user.suspendedAt) && !breakGlassApproved) return next(new ErrorResponse('Account is inactive or suspended', 403));
    req.breakGlassApproved = breakGlassApproved;
    req.user.canonicalRole = canonicalRole(req.user.role);
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

const authorize = (...roles) => (req, res, next) => {
  const role = req.user && (req.user.role || req.user.canonicalRole);
  const accepted = roles.flatMap(value => [value, canonicalRole(value)]);
  const isSuperAdmin = canonicalRole(role) === 'super-admin';
  const requestsAdminAccess = accepted.includes('admin') || accepted.includes('super-admin');
  if (!accepted.includes(role) && !accepted.includes(canonicalRole(role)) && !(isSuperAdmin && requestsAdminAccess)) {
    return next(new ErrorResponse('User role is not authorized to access this route', 403));
  }
  next();
};

const requirePermission = permission => asyncHandler(async (req, res, next) => {
  if (!req.user || !(await userHasPermission(req.user, permission))) {
    return next(new ErrorResponse('Insufficient permission', 403));
  }
  next();
});

const requireAnyPermission = permissions => asyncHandler(async (req, res, next) => {
  for (const permission of permissions) {
    if (req.user && await userHasPermission(req.user, permission)) return next();
  }
  return next(new ErrorResponse('Insufficient permission', 403));
});

const requireOwnership = (model, field = 'agent') => asyncHandler(async (req, res, next) => {
  const record = await model.findById(req.params.id).select(field);
  if (!record) return next(new ErrorResponse('Resource not found', 404));
  if (String(record[field]) !== String(req.user._id)) return next(new ErrorResponse('You do not own this resource', 403));
  req.ownedResource = record;
  next();
});

module.exports = { protect, authorize, requirePermission, requireAnyPermission, requireOwnership };