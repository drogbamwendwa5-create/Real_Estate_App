const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth');
const { getConversations, getMessages, sendMessage, markAsRead } = require('../Controllers/messageController');

const { conversationIdValidation, sendMessageValidation } = require('../Validators/messageValidators');
const validate = require('../Middleware/validation');

router.get('/conversations', protect, getConversations);
router.get('/:conversationId', protect, ...conversationIdValidation, validate, getMessages);
router.post('/', protect, ...sendMessageValidation, validate, sendMessage);
router.put('/:conversationId/read', protect, ...conversationIdValidation, validate, markAsRead);

module.exports = router;