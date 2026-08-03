const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../Middleware/auth');
const { createReport, listReports, updateReport } = require('../Controllers/reportController');

router.post('/', protect, requirePermission('report-listings'), createReport);
router.get('/', protect, requirePermission('review-reports'), listReports);
router.put('/:id', protect, requirePermission('review-reports'), updateReport);

module.exports = router;