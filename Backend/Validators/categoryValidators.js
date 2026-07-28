const { body, param } = require('express-validator');

exports.createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

exports.updateCategoryValidation = [
  param('id').isMongoId().withMessage('Invalid category ID'),
  body('name').optional().trim().isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

exports.categoryIdValidation = [
  param('id').isMongoId().withMessage('Invalid category ID'),
];