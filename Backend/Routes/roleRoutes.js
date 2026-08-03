const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../Middleware/auth');
const Role = require('../Models/Role');
const Permission = require('../Models/Permission');
const { recordAudit } = require('../Services/auditService');
const { validatePermissionIds, validateRolePermissionChange } = require('../Services/rbacService');

router.get('/', protect, requirePermission('manage-roles'), async (req, res, next) => {
  try {
    const roles = await Role.find({ active: true }).populate('permissions', 'key description active').lean();
    res.json({ success: true, data: roles });
  } catch (e) { next(e); }
});

router.get('/permissions', protect, requirePermission('manage-permissions'), async (req, res, next) => {
  try {
    res.json({ success: true, data: await Permission.find({ active: true }).select('key description active').sort('key').lean() });
  } catch (e) { next(e); }
});

router.put('/:id/permissions', protect, requirePermission('manage-permissions'), async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role || !role.active) return res.status(404).json({ success: false, message: 'Role not found' });
    const permissions = await validatePermissionIds(req.body.permissionIds);
    const permissionKeys = permissions.map(permission => permission.key);
    validateRolePermissionChange(role.key, permissionKeys);
    role.permissions = permissions.map(permission => permission._id);
    await role.save();
    await recordAudit(req, 'rbac.role.permissions.updated', 'Role', role._id, { roleKey: role.key, permissionKeys });
    res.json({ success: true, data: await role.populate('permissions', 'key description active') });
  } catch (e) { next(e); }
});

module.exports = router;