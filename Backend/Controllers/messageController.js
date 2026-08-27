const mongoose = require('mongoose');
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
  const { conversationId } = req.params;

  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(200).json({ success: true, data: [] });
  }

  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return res.status(200).json({ success: true, data: [] });
  }

  const isParticipant = (conversation.participants || []).some(
    (p) => p.toString() === req.user.id.toString()
  );

  if (!isParticipant) {
    return next(new ErrorResponse('Not authorized to access this conversation', 403));
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name email avatar')
    .sort('createdAt');

  res.status(200).json({ success: true, data: messages });
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId, content, text, conversationId } = req.body;
  const messageContent = (content || text || '').trim();

  if (!messageContent) {
    return next(new ErrorResponse('Message content is required', 400));
  }

  let conversation;
  if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
    conversation = await Conversation.findById(conversationId);
  }

  if (!conversation && receiverId && mongoose.Types.ObjectId.isValid(receiverId)) {
    conversation = await Conversation.create({
      participants: [req.user.id, receiverId],
    });
  }

  if (!conversation) {
    // If neither exists, create a default self or user conversation
    conversation = await Conversation.create({
      participants: [req.user.id, receiverId && mongoose.Types.ObjectId.isValid(receiverId) ? receiverId : req.user.id],
    });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user.id,
    content: messageContent,
    read: false,
  });

  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: {
      content: messageContent,
      sender: req.user.id,
      createdAt: new Date(),
    },
    updatedAt: new Date(),
  }).catch(() => {});

  res.status(201).json({ success: true, data: message });
});

// @desc    Mark messages as read
// @route   PUT /api/messages/:conversationId/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;

  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(200).json({ success: true, message: 'Messages marked as read' });
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return res.status(200).json({ success: true, message: 'Messages marked as read' });
  }

  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: req.user.id }, read: false },
    { read: true }
  );

  res.status(200).json({ success: true, message: 'Messages marked as read' });
});