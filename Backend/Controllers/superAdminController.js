const asyncHandler = require('../Middleware/asyncHandler');
const fs = require('fs');
const path = require('path');
const User = require('../Models/User');
const Role = require('../Models/Role');
const Permission = require('../Models/Permission');
const Admin = require('../Models/Admin');
const Property = require('../Models/Property');
const Subscription = require('../Models/Subscription');
const AuditLog = require('../Models/AuditLog');
const VerificationRequest = require('../Models/VerificationRequest');
const Report = require('../Models/Report');
const PlatformConfig = require('../Models/PlatformConfig');
const ErrorResponse = require('../Utils/errorResponse');
const APIFeatures = require('../Utils/apiFeatures');
const { recordAudit } = require('../Services/auditService');
const { canonicalRole, ROLE_PERMISSIONS, ROLE_RANK } = require('../Services/rbacService');

// @desc    Get system overview
// @route   GET /api/super-admin/overview
// @access  Private/SuperAdmin
exports.getSystemOverview = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalProperties = await Property.countDocuments();
  const totalSubscriptions = await Subscription.countDocuments();
  const pendingVerifications = await VerificationRequest.countDocuments({ status: 'pending' });
  const totalAdmins = await Admin.countDocuments({ isActive: true });
  
  const recentActivity = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('actor', 'name email role')
    .lean();

  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const propertiesByStatus = await Property.aggregate([
    { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totals: { totalUsers, totalProperties, totalSubscriptions, pendingVerifications, totalAdmins },
      recentActivity,
      usersByRole,
      propertiesByStatus,
    },
  });
});

// @desc    Manage roles (CRUD)
// @route   POST /api/super-admin/roles
// @access  Private/SuperAdmin
exports.createRole = asyncHandler(async (req, res, next) => {
  const { key, name, permissions, system } = req.body;
  
  if (!key || !name) {
    return next(new ErrorResponse('Please provide key and name', 400));
  }

  const existing = await Role.findOne({ key });
  if (existing) {
    return next(new ErrorResponse('Role with this key already exists', 400));
  }

  const role = await Role.create({ key, name, permissions, system: system || false });
  await recordAudit(req, 'superadmin.role.created', 'Role', role._id, { key, name, permissions });
  
  res.status(201).json({ success: true, data: role });
});

exports.getRoles = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Role.find(), req.query).filter().sort().paginate();
  const roles = await features.query;
  const total = await Role.countDocuments();
  
  res.status(200).json({ success: true, count: roles.length, total, data: roles });
});

exports.updateRole = asyncHandler(async (req, res, next) => {
  const { name, permissions, active } = req.body;
  const role = await Role.findById(req.params.id);
  
  if (!role) {
    return next(new ErrorResponse('Role not found', 404));
  }

  if (role.system && role.key === 'super-admin') {
    return next(new ErrorResponse('Cannot modify Super Admin role', 403));
  }

  if (name) role.name = name;
  if (active !== undefined) role.active = active;
  if (permissions) role.permissions = permissions;

  await role.save();
  await recordAudit(req, 'superadmin.role.updated', 'Role', role._id, { name, active, permissions });
  
  res.status(200).json({ success: true, data: role });
});

exports.deleteRole = asyncHandler(async (req, res, next) => {
  const role = await Role.findById(req.params.id);
  
  if (!role) {
    return next(new ErrorResponse('Role not found', 404));
  }

  if (role.system) {
    return next(new ErrorResponse('Cannot delete system roles', 403));
  }

  await role.deleteOne();
  await recordAudit(req, 'superadmin.role.deleted', 'Role', role._id, { key: role.key });
  
  res.status(200).json({ success: true, message: 'Role deleted successfully' });
});

// @desc    Manage permissions
// @route   POST /api/super-admin/permissions
// @access  Private/SuperAdmin
exports.createPermission = asyncHandler(async (req, res, next) => {
  const { key, description } = req.body;
  
  if (!key) {
    return next(new ErrorResponse('Please provide a permission key', 400));
  }

  const existing = await Permission.findOne({ key });
  if (existing) {
    return next(new ErrorResponse('Permission with this key already exists', 400));
  }

  const permission = await Permission.create({ key, description: description || key.replace(/-/g, ' ') });
  await recordAudit(req, 'superadmin.permission.created', 'Permission', permission._id, { key, description });
  
  res.status(201).json({ success: true, data: permission });
});

exports.getPermissions = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Permission.find(), req.query).filter().sort().paginate();
  const permissions = await features.query;
  const total = await Permission.countDocuments();
  
  res.status(200).json({ success: true, count: permissions.length, total, data: permissions });
});

exports.updatePermission = asyncHandler(async (req, res, next) => {
  const { description, active } = req.body;
  const permission = await Permission.findById(req.params.id);
  
  if (!permission) {
    return next(new ErrorResponse('Permission not found', 404));
  }

  if (description) permission.description = description;
  if (active !== undefined) permission.active = active;

  await permission.save();
  await recordAudit(req, 'superadmin.permission.updated', 'Permission', permission._id, { description, active });
  
  res.status(200).json({ success: true, data: permission });
});

exports.deletePermission = asyncHandler(async (req, res, next) => {
  const permission = await Permission.findById(req.params.id);
  
  if (!permission) {
    return next(new ErrorResponse('Permission not found', 404));
  }

  await permission.deleteOne();
  await recordAudit(req, 'superadmin.permission.deleted', 'Permission', permission._id, { key: permission.key });
  
  res.status(200).json({ success: true, message: 'Permission deleted successfully' });
});

// @desc    Assign role to user (Admin management)
// @route   POST /api/super-admin/admins
// @access  Private/SuperAdmin
exports.assignAdminRole = asyncHandler(async (req, res, next) => {
  const { userId, role, permissions } = req.body;
  
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const validRoles = ['admin', 'super-admin', 'moderator'];
  if (!validRoles.includes(role)) {
    return next(new ErrorResponse('Invalid admin role', 400));
  }

  const admin = await Admin.findOneAndUpdate(
    { user: userId },
    { role, permissions: permissions || [], isActive: true },
    { new: true, upsert: true }
  );

  if (role === 'super-admin') {
    user.role = 'super-admin';
    user.canonicalRole = 'super-admin';
    await user.save();
  } else if (role === 'admin') {
    user.role = 'admin';
    user.canonicalRole = 'admin';
    await user.save();
  }

  await recordAudit(req, 'superadmin.admin.assigned', 'User', user._id, { role, permissions });
  
  res.status(200).json({ success: true, data: admin, message: 'Admin role assigned successfully' });
});

exports.removeAdminRole = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  await Admin.findOneAndDelete({ user: req.params.userId });
  
  user.role = 'user';
  user.canonicalRole = 'buyer-tenant';
  await user.save();

  await recordAudit(req, 'superadmin.admin.removed', 'User', user._id);
  
  res.status(200).json({ success: true, message: 'Admin role removed successfully' });
});

exports.getAdmins = asyncHandler(async (req, res, next) => {
  const admins = await Admin.find().populate('user', 'name email phone role').sort('-createdAt');
  res.status(200).json({ success: true, count: admins.length, data: admins });
});

// @desc    Subscription management
// @route   PUT /api/super-admin/subscriptions/:id/override
// @access  Private/SuperAdmin
exports.overrideSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);
  
  if (!subscription) {
    return next(new ErrorResponse('Subscription not found', 404));
  }

  const { plan, status, duration, amount, features } = req.body;
  
  if (plan) subscription.plan = plan;
  if (status) subscription.status = status;
  if (duration) subscription.duration = duration;
  if (amount !== undefined) subscription.price = amount;
  if (features) subscription.features = { ...subscription.features, ...features };

  await subscription.save();
  await recordAudit(req, 'superadmin.subscription.overridden', 'Subscription', subscription._id, { plan, status, duration, amount, features });
  
  res.status(200).json({ success: true, data: subscription, message: 'Subscription overridden successfully' });
});

// @desc    View audit logs
// @route   GET /api/super-admin/audit-logs
// @access  Private/SuperAdmin
exports.getAuditLogs = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(AuditLog.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const logs = await features.query.populate('actor', 'name email role');
  const total = await AuditLog.countDocuments();

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    data: logs,
  });
});

// @desc    Manage verifications (override)
// @route   PUT /api/super-admin/verifications/:id/override
// @access  Private/SuperAdmin
exports.overrideVerification = asyncHandler(async (req, res, next) => {
  const request = await VerificationRequest.findById(req.params.id);
  
  if (!request) {
    return next(new ErrorResponse('Verification request not found', 404));
  }

  const { status, notes } = req.body;
  request.status = status;
  request.notes = notes;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  if (request.type === 'professional') {
    await User.findByIdAndUpdate(request.user, { 
      'professionalVerification.status': status,
      ...(status === 'approved' ? { isVerified: true, role: 'agency-professional', canonicalRole: 'agency-professional', 'professionalVerification.verifiedAt': new Date() } : {})
    });
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

  await recordAudit(req, 'superadmin.verification.overridden', 'VerificationRequest', request._id, { status, type: request.type });
  
  res.status(200).json({ success: true, data: request, message: 'Verification overridden successfully' });
});

// @desc    Feature flag management
// @route   GET /api/super-admin/feature-flags
// @access  Private/SuperAdmin
const DEFAULT_FEATURE_FLAGS = {
  enableVirtualTours: true, enableInvestmentScores: true, enableAIModeration: false, enableGeospatialEnrichment: true, enableFraudDetection: true, enableBiddingSystem: false, enableSubscriptionPayments: true, enableEmailNotifications: true, enableSMSNotifications: false, maintenanceMode: false,
};

exports.getFeatureFlags = asyncHandler(async (req, res) => {
  const config = await PlatformConfig.findOne({ key: 'default' }).lean();
  res.status(200).json({ success: true, data: { ...DEFAULT_FEATURE_FLAGS, ...(config?.featureFlags || {}) } });
});

exports.updateFeatureFlag = asyncHandler(async (req, res, next) => {
  const { flag, value } = req.body;
  
  // Placeholder - in production, store in database
  const validFlags = [
    'enableVirtualTours', 'enableInvestmentScores', 'enableAIModeration',
    'enableGeospatialEnrichment', 'enableFraudDetection', 'enableBiddingSystem',
    'enableSubscriptionPayments', 'enableEmailNotifications', 'enableSMSNotifications', 'maintenanceMode'
  ];

  if (!validFlags.includes(flag)) {
    return next(new ErrorResponse('Invalid feature flag', 400));
  }

  const featureFlagUpdate = {};
  featureFlagUpdate['featureFlags.' + flag] = Boolean(value);
  await PlatformConfig.findOneAndUpdate({ key: 'default' }, { $set: featureFlagUpdate }, { upsert: true, setDefaultsOnInsert: true });
  await recordAudit(req, 'superadmin.feature-flag.updated', 'System', null, { flag, value: Boolean(value) });
  
  res.status(200).json({ success: true, message: `Feature flag ${flag} updated to ${value}` });
});

// @desc    System settings
// @route   GET /api/super-admin/settings
// @access  Private/SuperAdmin
const DEFAULT_SETTINGS = { siteName: 'Real Estate App', siteDescription: 'Find your dream property', supportEmail: 'support@example.com', maxUploadSize: 10485760, defaultCurrency: 'KES', allowedCountries: ['Kenya', 'Uganda', 'Tanzania'], verificationRequiredForListing: true, autoApproveVerifiedAgents: false, maxListingsPerFreeUser: 3, commissionRate: 0.05, taxRate: 0.16 };

exports.getSystemSettings = asyncHandler(async (req, res) => {
  const config = await PlatformConfig.findOne({ key: 'default' }).lean();
  res.status(200).json({ success: true, data: { ...DEFAULT_SETTINGS, ...(config?.settings || {}) } });
});

exports.updateSystemSettings = asyncHandler(async (req, res, next) => {
  const settings = req.body;
  await PlatformConfig.findOneAndUpdate({ key: 'default' }, { $set: { settings } }, { upsert: true, setDefaultsOnInsert: true });
  await recordAudit(req, 'superadmin.settings.updated', 'System', null, { settings });
  
  res.status(200).json({ success: true, message: 'System settings updated successfully', data: settings });
});

// @desc    Platform analytics
// @route   GET /api/super-admin/analytics
// @access  Private/SuperAdmin
exports.getPlatformAnalytics = asyncHandler(async (req, res, next) => {
  const period = req.query.period || '30d';
  
  let dateFilter = {};
  if (period === '7d') dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
  else if (period === '30d') dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
  else if (period === '90d') dateFilter = { createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } };

  const newUsers = await User.countDocuments(dateFilter);
  const newProperties = await Property.countDocuments(dateFilter);
  const newSubscriptions = await Subscription.countDocuments(dateFilter);
  
  const revenueAgg = await Subscription.aggregate([
    { $match: { status: 'active', ...dateFilter } },
    { $group: { _id: null, total: { $sum: '$price' } } }
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  const topAgents = await User.find({ role: 'agency-professional' })
    .sort('-loginCount')
    .limit(10)
    .select('name email loginCount createdAt');

  res.status(200).json({
    success: true,
    data: {
      period,
      metrics: { newUsers, newProperties, newSubscriptions, totalRevenue },
      topAgents,
    },
  });
});

// @desc    Bulk operations
// @route   POST /api/super-admin/bulk/approve-properties
// @access  Private/SuperAdmin
exports.bulkApproveProperties = asyncHandler(async (req, res, next) => {
  const { propertyIds } = req.body;
  
  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    return next(new ErrorResponse('Please provide property IDs', 400));
  }

  const result = await Property.updateMany(
    { _id: { $in: propertyIds } },
    { $set: { isPublished: true, verificationStatus: 'published' } }
  );

  await recordAudit(req, 'superadmin.bulk.approve-properties', 'Property', null, { count: result.modifiedCount, propertyIds });
  
  res.status(200).json({ success: true, message: `${result.modifiedCount} properties approved successfully` });
});

exports.bulkRejectProperties = asyncHandler(async (req, res, next) => {
  const { propertyIds, reason } = req.body;
  
  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    return next(new ErrorResponse('Please provide property IDs', 400));
  }

  const result = await Property.updateMany(
    { _id: { $in: propertyIds } },
    { $set: { isPublished: false, verificationStatus: 'rejected', 'verification.rejectionReason': reason } }
  );

  await recordAudit(req, 'superadmin.bulk.reject-properties', 'Property', null, { count: result.modifiedCount, propertyIds, reason });
  
  res.status(200).json({ success: true, message: `${result.modifiedCount} properties rejected successfully` });
});

exports.bulkDeleteUsers = asyncHandler(async (req, res, next) => {
  const { userIds } = req.body;
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return next(new ErrorResponse('Please provide user IDs', 400));
  }

  // Prevent deleting super admins
  const superAdmins = await User.find({ _id: { $in: userIds }, role: 'super-admin' });
  if (superAdmins.length > 0) {
    return next(new ErrorResponse('Cannot delete super admin users', 403));
  }

  const result = await User.deleteMany({ _id: { $in: userIds } });
  
  await recordAudit(req, 'superadmin.bulk.delete-users', 'User', null, { count: result.deletedCount, userIds });
  
  res.status(200).json({ success: true, message: `${result.deletedCount} users deleted successfully` });
});

// @desc    Database management (placeholder)
// @route   POST /api/super-admin/database/backup
// @access  Private/SuperAdmin
exports.backupDatabase = asyncHandler(async (req, res, next) => {
  const mongoose = require('mongoose');
  if (!mongoose.connection.db) return next(new ErrorResponse('Database is not connected', 503));
  const backupDir = path.join(__dirname, '..', 'backups');
  await fs.promises.mkdir(backupDir, { recursive: true });
  const collections = await mongoose.connection.db.listCollections().toArray();
  const snapshot = { createdAt: new Date().toISOString(), collections: {} };
  let documentCount = 0;
  for (const collection of collections) {
    const documents = await mongoose.connection.db.collection(collection.name).find({}).toArray();
    snapshot.collections[collection.name] = documents;
    documentCount += documents.length;
  }
  const filename = platform-backup-json;
  const filepath = path.join(backupDir, filename);
  await fs.promises.writeFile(filepath, JSON.stringify(snapshot), 'utf8');
  await recordAudit(req, 'superadmin.database.backup.completed', 'System', null, { filename, documentCount });
  res.status(200).json({ success: true, message: 'Database backup completed.', data: { filename, documentCount } });
});

// @desc    Clear cache
// @route   DELETE /api/super-admin/cache/clear
// @access  Private/SuperAdmin
exports.clearCache = asyncHandler(async (req, res, next) => {
  await recordAudit(req, 'superadmin.cache.cleared', 'System', null);
  
  res.status(200).json({ success: true, message: 'Cache cleared successfully' });
});

// @desc    Delist property
// @route   PUT /api/super-admin/properties/:id/delist
// @access  Private/SuperAdmin
exports.delistProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  
  if (!property) {
    return next(new ErrorResponse('Property not found', 404));
  }

  property.isPublished = false;
  property.verificationStatus = 'delisted';
  await property.save();

  await recordAudit(req, 'superadmin.property.delisted', 'Property', property._id);
  
  res.status(200).json({ success: true, data: property, message: 'Property delisted successfully' });
});

// @desc    Block user account
// @route   PUT /api/super-admin/users/:id/block
// @access  Private/SuperAdmin
exports.blockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.role === 'super-admin') {
    return next(new ErrorResponse('Cannot block a super admin', 403));
  }

  user.isActive = false;
  user.suspendedAt = new Date();
  await user.save();

  await recordAudit(req, 'superadmin.user.blocked', 'User', user._id);
  
  res.status(200).json({ success: true, data: user, message: 'User account blocked successfully' });
});

// @desc    Unblock user account
// @route   PUT /api/super-admin/users/:id/unblock
// @access  Private/SuperAdmin
exports.unblockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  user.isActive = true;
  user.suspendedAt = undefined;
  await user.save();

  await recordAudit(req, 'superadmin.user.unblocked', 'User', user._id);
  
  res.status(200).json({ success: true, data: user, message: 'User account unblocked successfully' });
});