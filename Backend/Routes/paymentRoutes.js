const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth');
const { createPaymentIntent, getUserPayments, confirmPayment, getAllPayments } = require('../Controllers/paymentController');

router.post('/create', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/', protect, getUserPayments);
router.get('/all', protect, getAllPayments);

module.exports = router;

