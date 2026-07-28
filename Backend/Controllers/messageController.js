const asyncHandler = require('../Middleware/asyncHandler');
const Message = require('../Models/Message');
const Conversation = require('../Models/Conversation');
const ErrorResponse = require('../Utils/errorResponse');

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const conversations = await Conversation.find({
    participants: req.user.id,
  }).populate('participants', 'name email avatar');

  res.status(200).json({ success: true, data: conversations });
});

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.conversationId);
  
  if (!conversation) {
    return next(new ErrorResponse('Conversation not found', 404));
  }

  if (!conversation.participants.includes(req.user.id)) {
    return next(new ErrorResponse('Not authorized to access this conversation', 403));
  }

  const messages = await Message.find({ conversation: req.params.conversationId })
    .populate('sender', 'name email avatar')
    .sort('createdAt');

  res.status(200).json({ success: true, data: messages });
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId, content, conversationId } = req.body;

  let conversation;
  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
  } else {
    conversation = await Conversation.create({
      participants: [req.user.id, receiverId],
    });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user.id,
    content,
    read: false,
  });

  await conversation.save();

  res.status(201).json({ success: true, data: message });
});

// @desc    Mark messages as read
// @route   PUT /api/messages/:conversationId/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.conversationId);

  if (!conversation) {
    return next(new ErrorResponse('Conversation not found', 404));
  }

  if (!conversation.participants.includes(req.user.id)) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  await Message.updateMany(
    { conversation: req.params.conversationId, sender: { $ne: req.user.id }, read: false },
    { read: true }
  );

  res.status(200).json({ success: true, message: 'Messages marked as read' });
});