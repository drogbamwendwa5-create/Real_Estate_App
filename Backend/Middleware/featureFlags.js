const PlatformConfig = require('../Models/PlatformConfig');

/**
 * Middleware to enforce maintenance mode.
 * Blocks all non-super-admin requests when maintenance mode is enabled.
 */
const maintenanceMode = async (req, res, next) => {
  try {
    const config = await PlatformConfig.findOne({ key: 'default' }).lean();
    const maintenanceModeEnabled = config?.featureFlags?.maintenanceMode === true;

    if (maintenanceModeEnabled) {
      // Allow super-admins to bypass maintenance mode
      const userRole = req.user?.role || req.user?.canonicalRole;
      if (userRole === 'super-admin') {
        return next();
      }

      return res.status(503).json({
        success: false,
        message: 'Platform is currently under maintenance. Please try again later.',
        data: null,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check specific feature flags
 * @param {string} flagName - The feature flag to check
 * @param {boolean} defaultValue - Default value if flag is not set
 */
const requireFeatureFlag = (flagName, defaultValue = false) => {
  return async (req, res, next) => {
    try {
      const config = await PlatformConfig.findOne({ key: 'default' }).lean();
      const flagValue = config?.featureFlags?.[flagName] ?? defaultValue;

      if (!flagValue) {
        return res.status(403).json({
          success: false,
          message: `Feature ${flagName} is currently disabled.`,
          data: null,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Attach feature flags to request object for use in controllers
 */
const attachFeatureFlags = async (req, res, next) => {
  try {
    const config = await PlatformConfig.findOne({ key: 'default' }).lean();
    const DEFAULT_FEATURE_FLAGS = {
      enableVirtualTours: true,
      enableInvestmentScores: true,
      enableAIModeration: false,
      enableGeospatialEnrichment: true,
      enableFraudDetection: true,
      enableBiddingSystem: false,
      enableSubscriptionPayments: true,
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      maintenanceMode: false,
    };

    req.featureFlags = { ...DEFAULT_FEATURE_FLAGS, ...(config?.featureFlags || {}) };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  maintenanceMode,
  requireFeatureFlag,
  attachFeatureFlags,
};