const { canonicalRole, assertRoleChangeAllowed, validateRolePermissionChange } = require('../Services/rbacService');
const { encryptBuffer, decryptBuffer } = require('../Services/secureDocumentService');
const Property = require('../Models/Property');

describe('verification and RBAC primitives', () => {
  beforeEach(() => {
    process.env.DOCUMENT_ENCRYPTION_KEY = 'test-only-key';
  });

  test('maps legacy roles without breaking compatibility', () => {
    expect(canonicalRole('user')).toBe('buyer-tenant');
    expect(canonicalRole('agent')).toBe('agency-professional');
    expect(canonicalRole('super-admin')).toBe('super-admin');
  });

  test('encrypts and decrypts verification documents', () => {
    const original = Buffer.from('private-title-deed');
    const encrypted = encryptBuffer(original);
    expect(encrypted.ciphertext.equals(original)).toBe(false);
    expect(decryptBuffer(encrypted).toString()).toBe(original.toString());
  });


  test('prevents privilege escalation through role assignment', () => {
    expect(() => assertRoleChangeAllowed({ role: 'admin' }, 'super-admin', 'buyer-tenant')).toThrow();
    expect(() => assertRoleChangeAllowed({ role: 'admin' }, 'admin', 'buyer-tenant')).toThrow();
    expect(() => assertRoleChangeAllowed({ role: 'super-admin' }, 'admin', 'super-admin')).not.toThrow();
  });


  test('only administrators can elevate users', () => {
    expect(() => assertRoleChangeAllowed({ role: 'admin' }, 'agency-professional', 'buyer-tenant')).not.toThrow();
    expect(() => assertRoleChangeAllowed({ role: 'admin' }, 'property-owner', 'buyer-tenant')).not.toThrow();
    expect(() => assertRoleChangeAllowed({ role: 'buyer-tenant' }, 'agency-professional', 'buyer-tenant')).toThrow();
    expect(() => assertRoleChangeAllowed({ role: 'guest' }, 'property-owner', 'guest')).toThrow();
  });
  test('protects mandatory Super Admin permissions', () => {
    expect(() => validateRolePermissionChange('super-admin', ['manage-users'])).toThrow();
    expect(() => validateRolePermissionChange('super-admin', ['manage-roles', 'manage-permissions', 'manage-admins', 'view-audit-logs'])).not.toThrow();
  });
  test('property schema exposes a staged verification workflow', () => {
    const path = Property.schema.path('verificationStatus');
    expect(path.enumValues).toContain('submitted');
    expect(path.enumValues).toContain('moderator-review');
    expect(path.enumValues).toContain('published');
  });
});