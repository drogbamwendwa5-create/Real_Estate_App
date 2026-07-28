const { body, param } = require('express-validator');

exports.createPropertyValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('propertyType').isIn(['apartment', 'house', 'land', 'commercial']).withMessage('Invalid property type'),
  body('status').isIn(['for-sale', 'for-rent', 'sold', 'rented']).withMessage('Invalid status'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('area').optional().isFloat({ min: 0 }).withMessage('Area must be a positive number'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.country').optional().trim(),
];

exports.updatePropertyValidation = [
  param('id').isMongoId().withMessage('Invalid property ID'),
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('propertyType').optional().isIn(['apartment', 'house', 'land', 'commercial']).withMessage('Invalid property type'),
  body('status').optional().isIn(['for-sale', 'for-rent', 'sold', 'rented']).withMessage('Invalid status'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('area').optional().isFloat({ min: 0 }).withMessage('Area must be a positive number'),
];