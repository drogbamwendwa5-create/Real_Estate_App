const { param } = require('express-validator');

exports.propertyIdValidation = [
  param('propertyId').isMongoId().withMessage('Invalid property ID'),
];