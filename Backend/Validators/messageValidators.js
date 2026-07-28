const { body, param } = require('express-validator');

exports.sendMessageValidation = [
  param('conversationId').optional().isMongoId().withMessage('Invalid conversation ID'),
  body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
  body('content').trim().notEmpty().withMessage('Message content is required').isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
];

exports.conversationIdValidation = [
  param('conversationId').isMongoId().withMessage('Invalid conversation ID'),
];