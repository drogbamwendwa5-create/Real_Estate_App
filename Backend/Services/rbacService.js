const mongoose = require('mongoose');
const Permission = require('../Models/Permission');
const Role = require('../Models/Role');

const ROLE_PERMISSIONS = {
  'super-admin': ['manage-admins', 'manage-users', 'manage-agencies', 'manage-listings', 'manage-subscriptions', 'manage-payments', 'manage-feature-flags', 'manage-settings', 'view-audit-logs', 'configure-verification', 'configure-moderation', 'manage-apis', 'manage-backups', 'manage-roles', 'manage-permissions'],
  admin: ['manage-users', 'approve-listings', 'reject-listings', 'hide-listings', 'suspend-users', 'verify-professionals', 'verify-owners', 'verify-listings', 'review-reports', 'manage-categories', 'manage-reviews', 'moderate-messages', 'view-analytics'],
  'agency-professional': ['create-listings', 'edit-own-listings', 'archive-own-listings', 'upload-media', 'manage-properties', 'schedule-viewings', 'respond-inquiries', 'manage-clients', 'view-analytics'],
  'property-owner': ['create-listings', 'edit-own-listings', 'archive-own-listings', 'upload-media', 'upload-ownership-documents', 'schedule-viewings', 'receive-inquiries', 'view-listing-analytics', 'mark-property-status'],
  'buyer-tenant': ['browse-listings', 'save-favorites', 'save-searches', 'compare-listings', 'contact-sellers', 'schedule-viewings', 'submit-offers', 'apply-rentals', 'leave-reviews', 'receive-alerts', 'report-listings'],
  guest: ['browse-listings', 'search-listings', 'filter-listings', 'view-maps', 'view-public-profiles']
};

const ROLE_NAMES = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  'agency-professional': 'Agency / Professional',
  'property-owner': 'Property Owner',
  'buyer-tenant': 'Buyer / Tenant',
  guest: 'Guest'
};

const LEGACY_ROLE_MAP = { user: 'buyer-tenant', agent: 'agency-professional' };
const ROLE_RANK = { guest: 0, 'buyer-tenant': 10, 'property-owner': 20, 'agency-professional': 30, admin: 80, 'super-admin': 100 };
const SUPER_ADMIN_PROTECTED = ['manage-roles', 'manage-permissions', 'manage-admins', 'view-audit-logs'];

const canonicalRole = role => LEGACY_ROLE_MAP[role] || role || 'guest';

const seedRbac = async () => {
  for (const key of Object.keys(ROLE_PERMISSIONS)) {
    const permissionIds = [];
    for (const permissionKey of ROLE_PERMISSIONS[key]) {
      const permission = await Permission.findOneAndUpdate(
        { key: permissionKey },
        { $setOnInsert: { key: permissionKey, description: permissionKey.replace(/-/g, ' ') } },
        { upsert: true, new: true }
      );
      permissionIds.push(permission._id);
    }
    const existingRole = await Role.findOne({ key });
    if (!existingRole) {
      await Role.create({ key, name: ROLE_NAMES[key], permissions: permissionIds, system: true, active: true });
    } else if (!existingRole.name || !existingRole.permissions || existingRole.permissions.length === 0) {
      existingRole.name = ROLE_NAMES[key];
      existingRole.permissions = permissionIds;
      existingRole.system = true;
      await existingRole.save();
    }
  }
};

const userHasPermission = async (user, permissionKey) => {
  // Super Admin is the platform authority and must not depend on seeded role rows.
  if (canonicalRole(user?.role || user?.canonicalRole) === 'super-admin') return true;
  const role = await Role.findOne({ key: canonicalRole(user.role), active: true }).populate('permissions', 'key active');
  return Boolean(role && role.permissions.some(permission => permission.active !== false && permission.key === permissionKey));
};

const assertRoleChangeAllowed = (actor, targetRole, currentTargetRole) => {
  const actorRole = canonicalRole(actor.role);
  const requestedRole = canonicalRole(targetRole);
  const currentRole = canonicalRole(currentTargetRole);
  if (!ROLE_NAMES[requestedRole]) throw new Error('Invalid role specified');
  if (currentRole === 'super-admin' && actorRole !== 'super-admin') throw new Error('Only a Super Admin can modify a Super Admin');
  if (requestedRole === 'super-admin' && actorRole !== 'super-admin') throw new Error('Only a Super Admin can assign the Super Admin role');
  if (['admin', 'super-admin'].includes(requestedRole) && actorRole !== 'super-admin') throw new Error('Only a Super Admin can manage administrator roles');
  if ((ROLE_RANK[requestedRole] || 0) > (ROLE_RANK[actorRole] || 0)) throw new Error('Cannot assign a role above your authority');
  return true;
};

const validatePermissionIds = async permissionIds => {
  if (!Array.isArray(permissionIds)) throw new Error('permissionIds must be an array');
  const uniqueIds = [...new Set(permissionIds.map(String))];
  if (uniqueIds.some(id => !mongoose.isValidObjectId(id))) throw new Error('One or more permissions are invalid');
  const permissions = await Permission.find({ _id: { $in: uniqueIds }, active: true }).select('_id key');
  if (permissions.length !== uniqueIds.length) throw new Error('One or more permissions are invalid or inactive');
  return permissions;
};

const validateRolePermissionChange = (roleKey, permissionKeys) => {
  if (roleKey === 'super-admin') {
    for (const required of SUPER_ADMIN_PROTECTED) {
      if (!permissionKeys.includes(required)) throw new Error('Super Admin cannot lose ' + required);
    }
  }
  return true;
};

module.exports = {
  seedRbac,
  canonicalRole,
  userHasPermission,
  assertRoleChangeAllowed,
  validatePermissionIds,
  validateRolePermissionChange,
  ROLE_PERMISSIONS,
  ROLE_NAMES,
  ROLE_RANK,
  SUPER_ADMIN_PROTECTED
};