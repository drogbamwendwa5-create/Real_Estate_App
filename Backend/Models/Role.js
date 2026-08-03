const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  permissions: [{ type: mongoose.Schema.ObjectId, ref: 'Permission' }],
  system: { type: Boolean, default: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

RoleSchema.pre('validate', function () {
  if (!this.isNew && this.isModified('key') && this.system) return next(new Error('System role keys are immutable'));
  if (!this.isNew && this.isModified('system') && this.get('system') === false) return next(new Error('System roles cannot be demoted'));
});

module.exports = mongoose.model('Role', RoleSchema);