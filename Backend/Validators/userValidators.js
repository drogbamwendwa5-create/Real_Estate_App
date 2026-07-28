const { body, param } = require('express-validator');

exports.updateUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim().isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').optional().trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('role').optional().isIn(['user', 'agent', 'admin']).withMessage('Invalid role'),
];

exports.userIdValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

exports.updateProfileValidation = [
  body('name').optional().trim().isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').optional().trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
];