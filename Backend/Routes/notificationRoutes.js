const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } = require('../Controllers/notificationController');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;