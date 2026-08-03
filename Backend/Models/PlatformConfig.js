const mongoose = require('mongoose');

const PlatformConfigSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'default' },
  featureFlags: { type: mongoose.Schema.Types.Mixed, default: {} },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('PlatformConfig', PlatformConfigSchema);
