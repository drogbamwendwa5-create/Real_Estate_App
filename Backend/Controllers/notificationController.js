const asyncHandler = require('../Middleware/asyncHandler');
const Notification = require('../Models/Notification');
const ErrorResponse = require('../Utils/errorResponse');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: notifications.length, data: notifications });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return next(new ErrorResponse('Notification not found', 404));
  notification.read = true;
  await notification.save();
  res.status(200).json({ success: true, data: notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return next(new ErrorResponse('Notification not found', 404));
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  await notification.deleteOne();
  res.status(200).json({ success: true, data: {}, message: 'Notification deleted' });
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({ user: req.user.id, read: false });
  res.status(200).json({ success: true, count });
});
