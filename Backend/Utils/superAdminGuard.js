const bcrypt = require('bcryptjs');
const { canonicalRole } = require('../Services/rbacService');

const isSuperAdmin = user => canonicalRole(user?.role || user?.canonicalRole) === 'super-admin';

const verifyBreakGlassPin = async pin => {
  try {
    const hash = process.env.SUPER_ADMIN_BREAK_GLASS_PIN_HASH;
    return Boolean(hash && pin && (await bcrypt.compare(String(pin), hash)));
  } catch (err) {
    return false;
  }
};

const requireProtectedSuperAdminPin = async (actor, target, pin) => {
  if (!isSuperAdmin(target)) return false;
  if (!isSuperAdmin(actor)) throw new Error('Only a Super Admin can modify a Super Admin');
  if (!await verifyBreakGlassPin(pin)) throw new Error('A valid Super Admin break-glass PIN is required');
  return true;
};

module.exports = { isSuperAdmin, verifyBreakGlassPin, requireProtectedSuperAdminPin };
