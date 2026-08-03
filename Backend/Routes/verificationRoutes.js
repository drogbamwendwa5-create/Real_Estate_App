const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../Middleware/auth');
const { documentUpload } = require('../Middleware/upload');
const controller = require('../Controllers/verificationController');

router.use(protect);
router.get('/mine', controller.getMyVerification);
router.post('/professional', controller.submitProfessional);
router.post('/ownership', requirePermission('upload-ownership-documents'), documentUpload.array('documents', 5), controller.submitOwnership);
router.post('/listings/:propertyId/submit', requirePermission('edit-own-listings'), controller.submitListing);
router.get('/', requirePermission('verify-listings'), controller.listVerification);
router.put('/:id/review', requirePermission('verify-listings'), controller.reviewVerification);
router.get('/:id/documents/:documentId', requirePermission('verify-owners'), controller.downloadDocument);

module.exports = router;