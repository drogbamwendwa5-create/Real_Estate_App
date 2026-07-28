const { body, param } = require('express-validator');

exports.createReviewValidation = [
  param('propertyId').isMongoId().withMessage('Invalid property ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
];

exports.updateReviewValidation = [
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
];

exports.reviewIdValidation = [
  param('id').isMongoId().withMessage('Invalid review ID'),
];