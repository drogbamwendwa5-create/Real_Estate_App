const { body, param } = require('express-validator');

exports.sendMessageValidation = [
  body('conversationId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid conversation ID'),
  body('receiverId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid receiver ID'),
  body().custom((value) => {
    const text = (value.content || value.text || '').trim();
    if (!text) {
      throw new Error('Message content is required');
    }
    if (text.length > 2000) {
      throw new Error('Message cannot exceed 2000 characters');
    }
    if (!value.conversationId && !value.receiverId) {
      throw new Error('Either conversationId or receiverId is required');
    }
    return true;
  }),
];

exports.conversationIdValidation = [
  param('conversationId').custom((value) => {
    if (!value || value === 'undefined' || value === 'null') {
      throw new Error('Invalid conversation ID');
    }
    return true;
  }),
];