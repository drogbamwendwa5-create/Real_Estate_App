const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../Middleware/auth');
const {
  getSystemOverview,
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  createPermission,
  getPermissions,
  updatePermission,
  deletePermission,
  assignAdminRole,
  removeAdminRole,
  getAdmins,
  overrideSubscription,
  getAuditLogs,
  overrideVerification,
  getFeatureFlags,
  updateFeatureFlag,
  getSystemSettings,
  updateSystemSettings,
  getPlatformAnalytics,
  bulkApproveProperties,
  bulkRejectProperties,
  bulkDeleteUsers,
  backupDatabase,
  clearCache,
  delistProperty,
  blockUser,
  unblockUser
} = require('../Controllers/superAdminController');

// All routes require super-admin permission
router.use(protect, requirePermission('manage-admins'));

// System overview
router.get('/overview', getSystemOverview);

// Role management
router.post('/roles', requirePermission('manage-roles'), createRole);
router.get('/roles', requirePermission('manage-roles'), getRoles);
router.put('/roles/:id', requirePermission('manage-roles'), updateRole);
router.delete('/roles/:id', requirePermission('manage-roles'), deleteRole);

// Permission management
router.post('/permissions', requirePermission('manage-permissions'), createPermission);
router.get('/permissions', requirePermission('manage-permissions'), getPermissions);
router.put('/permissions/:id', requirePermission('manage-permissions'), updatePermission);
router.delete('/permissions/:id', requirePermission('manage-permissions'), deletePermission);

// Admin management
router.post('/admins', requirePermission('manage-admins'), assignAdminRole);
router.delete('/admins/:userId', requirePermission('manage-admins'), removeAdminRole);
router.get('/admins', requirePermission('manage-admins'), getAdmins);

// Subscription management
router.put('/subscriptions/:id/override', requirePermission('manage-subscriptions'), overrideSubscription);

// Audit logs
router.get('/audit-logs', requirePermission('view-audit-logs'), getAuditLogs);

// Verification management
router.put('/verifications/:id/override', requirePermission('configure-verification'), overrideVerification);

// Feature flags
router.get('/feature-flags', requirePermission('manage-feature-flags'), getFeatureFlags);
router.put('/feature-flags', requirePermission('manage-feature-flags'), updateFeatureFlag);

// System settings
router.get('/settings', requirePermission('manage-settings'), getSystemSettings);
router.put('/settings', requirePermission('manage-settings'), updateSystemSettings);

// Analytics
router.get('/analytics', requirePermission('view-audit-logs'), getPlatformAnalytics);

// Bulk operations
router.post('/bulk/approve-properties', requirePermission('manage-listings'), bulkApproveProperties);
router.post('/bulk/reject-properties', requirePermission('manage-listings'), bulkRejectProperties);
router.post('/bulk/delete-users', requirePermission('manage-users'), bulkDeleteUsers);

// Database management
router.post('/database/backup', requirePermission('manage-backups'), backupDatabase);
router.delete('/cache/clear', requirePermission('manage-backups'), clearCache);

// Property management
router.put('/properties/:id/delist', requirePermission('manage-listings'), delistProperty);

// User account management
router.put('/users/:id/block', requirePermission('manage-users'), blockUser);
router.put('/users/:id/unblock', requirePermission('manage-users'), unblockUser);

module.exports = router;
