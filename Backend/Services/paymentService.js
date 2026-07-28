let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (err) {
  console.warn('Stripe is not configured — STRIPE_SECRET_KEY missing');
}

const Payment = require('../Models/Payment');
const Subscription = require('../Models/Subscription');
const ErrorResponse = require('../Utils/errorResponse');

const createPayment = async (paymentData) => {
  try {
    if (!stripe) {
      throw new ErrorResponse('Payment service not configured', 500);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentData.amount * 100),
      currency: paymentData.currency || 'usd',
      metadata: {
        userId: paymentData.user,
        subscriptionId: paymentData.subscriptionId || '',
        propertyId: paymentData.propertyId || '',
      },
    });

    const payment = await Payment.create({
      user: paymentData.user,
      amount: paymentData.amount,
      currency: paymentData.currency || 'usd',
      paymentIntentId: paymentIntent.id,
      status: 'pending',
      subscriptionId: paymentData.subscriptionId,
      propertyId: paymentData.propertyId,
    });

    return payment;
  } catch (error) {
    throw error;
  }
};

const handlePaymentSuccess = async (payment, paymentIntentId) => {
  payment.status = 'completed';
  payment.paymentIntentId = paymentIntentId;
  await payment.save();

  if (payment.subscriptionId) {
    const subscription = await Subscription.findById(payment.subscriptionId);
    if (subscription) {
      subscription.status = 'active';
      subscription.startDate = Date.now();
      subscription.endDate = new Date(Date.now() + subscription.duration * 24 * 60 * 60 * 1000);
      await subscription.save();
    }
  }
};

const handlePaymentFailure = async (paymentIntentId) => {
  const payment = await Payment.findOne({ paymentIntentId });
  if (payment) {
    payment.status = 'failed';
    await payment.save();
  }
};

const refundPayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment || payment.status !== 'completed') {
    throw new ErrorResponse('Payment cannot be refunded', 400);
  }

  if (stripe) {
    await stripe.refunds.create({ payment_intent: payment.paymentIntentId });
  }
  payment.status = 'refunded';
  await payment.save();

  return payment;
};

module.exports = { createPayment, handlePaymentSuccess, handlePaymentFailure, refundPayment };
