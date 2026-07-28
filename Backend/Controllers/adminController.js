const asyncHandler = require('../Middleware/asyncHandler');
const User = require('../Models/User');
const Property = require('../Models/Property');
const Subscription = require('../Models/Subscription');
const ErrorResponse = require('../Utils/errorResponse');
const APIFeatures = require('../Utils/apiFeatures');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalProperties = await Property.countDocuments();

  const stats = {
    totalUsers,
    totalProperties,
  };

  res.status(200).json({ success: true, data: stats });
});

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    data: users,
  });
});

// @desc    Manage user (update role, ban/activate)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.manageUser = asyncHandler(async (req, res, next) => {
  const { role, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (role) {
    const validRoles = ['user', 'agent', 'admin'];
    if (!validRoles.includes(role)) {
      return next(new ErrorResponse('Invalid role specified', 400));
    }
    user.role = role;
  }

  if (isActive !== undefined) {
    user.isActive = isActive;
  }

  await user.save();

  res.status(200).json({ success: true, data: user, message: 'User updated successfully' });
});

// @desc    Get all properties (Admin - includes unpublished)
// @route   GET /api/admin/properties
// @access  Private/Admin
exports.getProperties = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Property.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const properties = await features.query.populate('agent', 'name email phone');
  const total = await Property.countDocuments();

  res.status(200).json({
    success: true,
    count: properties.length,
    total,
    data: properties,
  });
});

// @desc    Manage property (approve, reject, toggle publish/featured)
// @route   PUT /api/admin/properties/:id
// @access  Private/Admin
exports.manageProperty = asyncHandler(async (req, res, next) => {
  const { isPublished, isFeatured, status } = req.body;

  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new ErrorResponse('Property not found', 404));
  }

  if (isPublished !== undefined) property.isPublished = isPublished;
  if (isFeatured !== undefined) property.isFeatured = isFeatured;
  if (status) property.status = status;

  await property.save();

  res.status(200).json({ success: true, data: property, message: 'Property updated successfully' });
});

// @desc    Get admin reports (aggregated statistics)
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = asyncHandler(async (req, res, next) => {
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const propertiesByStatus = await Property.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const subscriptionsActive = await Subscription.countDocuments({ status: 'active' });
  const subscriptionsCancelled = await Subscription.countDocuments({ status: 'cancelled' });

  res.status(200).json({
    success: true,
    data: {
      usersByRole,
      propertiesByStatus,
      subscriptions: {
        active: subscriptionsActive,
        cancelled: subscriptionsCancelled,
      },
    },
  });
});
