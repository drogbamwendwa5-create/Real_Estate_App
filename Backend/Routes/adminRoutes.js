const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../Middleware/auth');
const { getDashboardStats, getUsers, manageUser, getProperties, manageProperty, getReports } = require('../Controllers/adminController');

router.use(protect, requirePermission('view-analytics'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', requirePermission('manage-users'), manageUser);
router.get('/properties', getProperties);
router.put('/properties/:id', manageProperty);
router.get('/reports', getReports);

module.exports = router;