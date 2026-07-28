const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth');
const { getDashboardStats, getUsers, manageUser, getProperties, manageProperty, getReports } = require('../Controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', manageUser);
router.get('/properties', getProperties);
router.put('/properties/:id', manageProperty);
router.get('/reports', getReports);

module.exports = router;