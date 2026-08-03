const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
  },
  avatar: {
    public_id: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  role: {
    type: String,
    enum: ['user', 'agent', 'admin', 'super-admin', 'agency-professional', 'property-owner', 'buyer-tenant', 'guest'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  canonicalRole: {
    type: String,
    enum: ['super-admin', 'admin', 'agency-professional', 'property-owner', 'buyer-tenant', 'guest'],
    default: 'buyer-tenant',
    index: true,
  },
  profile: {
    displayName: String,
    coverPhoto: { public_id: String, url: String },
    bio: { type: String, maxlength: 2000 },
    languages: [String],
    country: String,
    county: String,
    city: String,
    address: String,
    company: String,
    website: String,
    socialLinks: { type: Map, of: String },
  },
  professionalVerification: {
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' },
    verifiedAt: Date,
    expiresAt: Date,
  },
  ownerVerification: {
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' },
    verifiedAt: Date,
    expiresAt: Date,
  },
  onlineStatus: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
  lastSeenAt: Date,
  loginCount: { type: Number, default: 0 },
  failedLoginCount: { type: Number, default: 0 },
  suspendedAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ROLE_CANONICAL = { user: 'buyer-tenant', agent: 'agency-professional' };

UserSchema.pre('validate', function () {
  const expected = ROLE_CANONICAL[this.role] || this.role;
  if (this.canonicalRole !== expected) this.canonicalRole = expected;
});
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id, role: this.role, canonicalRole: this.canonicalRole }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

UserSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);