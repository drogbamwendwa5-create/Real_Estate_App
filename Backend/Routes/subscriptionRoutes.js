const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth');
const { createSubscription, getSubscriptions, getMySubscriptions, cancelSubscription } = require('../Controllers/subscriptionController');

router.post('/', protect, createSubscription);
router.get('/', protect, getSubscriptions);
router.get('/my-subscriptions', protect, getMySubscriptions);
router.put('/:id/cancel', protect, cancelSubscription);

module.exports = router;