const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

PermissionSchema.pre('validate', function () {
  if (!this.isNew && this.isModified('key')) return next(new Error('Permission keys are immutable'));
});

module.exports = mongoose.model('Permission', PermissionSchema);