const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth');
const { getPropertyReviews, getReview, createReview, updateReview, deleteReview } = require('../Controllers/reviewController');

const { createReviewValidation, updateReviewValidation, reviewIdValidation } = require('../Validators/reviewValidators');
const validate = require('../Middleware/validation');

router.get('/property/:propertyId', getPropertyReviews);
router.get('/:id', ...reviewIdValidation, validate, getReview);
router.post('/property/:propertyId', protect, ...createReviewValidation, validate, createReview);
router.put('/:id', protect, ...reviewIdValidation, validate, updateReview);
router.delete('/:id', protect, ...reviewIdValidation, validate, deleteReview);

module.exports = router;