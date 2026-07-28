const Notification = require('../Models/Notification');

const createNotification = async (userId, message, type = 'info', referenceId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      message,
      type,
      referenceId,
    });
    return notification;
  } catch (error) {
    throw error;
  }
};

const getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({ user: userId, read: false });
  } catch (error) {
    throw error;
  }
};

module.exports = { createNotification, getUnreadCount };