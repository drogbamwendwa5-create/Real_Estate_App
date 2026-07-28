const asyncHandler = require('../Middleware/asyncHandler');
const Subscription = require('../Models/Subscription');
const ErrorResponse = require('../Utils/errorResponse');

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private/Admin
exports.getSubscriptions = asyncHandler(async (req, res, next) => {
  const subscriptions = await Subscription.find().populate('user', 'name email').sort('-createdAt');
  res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
});

// @desc    Get user subscriptions
// @route   GET /api/subscriptions/my-subscriptions
// @access  Private
exports.getMySubscriptions = asyncHandler(async (req, res, next) => {
  const subscriptions = await Subscription.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
});

// @desc    Create subscription
// @route   POST /api/subscriptions
// @access  Private
exports.createSubscription = asyncHandler(async (req, res, next) => {
  const { plan, duration, amount } = req.body;

  const subscription = await Subscription.create({
    user: req.user.id,
    plan,
    duration,
    amount,
    status: 'pending',
  });

  res.status(201).json({ success: true, data: subscription });
});

// @desc    Get subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
exports.getPlans = asyncHandler(async (req, res, next) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      duration: 'monthly',
      features: {
        maxListings: 3,
        featuredListings: 0,
        imageUploads: 5,
        virtualTours: false,
        analytics: false,
      },
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      duration: 'monthly',
      features: {
        maxListings: 10,
        featuredListings: 2,
        imageUploads: 20,
        virtualTours: false,
        analytics: true,
      },
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 79,
      duration: 'monthly',
      features: {
        maxListings: 50,
        featuredListings: 10,
        imageUploads: 100,
        virtualTours: true,
        analytics: true,
      },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      duration: 'monthly',
      features: {
        maxListings: -1,
        featuredListings: -1,
        imageUploads: -1,
        virtualTours: true,
        analytics: true,
      },
    },
  ];

  res.status(200).json({ success: true, count: plans.length, data: plans });
});

// @desc    Upgrade subscription
// @route   PUT /api/subscriptions/:id/upgrade
// @access  Private
exports.upgradeSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorResponse('Subscription not found', 404));
  }

  if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to upgrade this subscription', 403));
  }

  const { plan } = req.body;
  const validPlans = ['free', 'basic', 'premium', 'enterprise'];

  if (!plan || !validPlans.includes(plan)) {
    return next(new ErrorResponse('Please provide a valid plan', 400));
  }

  subscription.plan = plan;
  subscription.status = 'active';
  await subscription.save();

  res.status(200).json({ success: true, data: subscription, message: 'Subscription upgraded successfully' });
});

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/:id/cancel
// @access  Private
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorResponse('Subscription not found', 404));
  }

  if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to cancel this subscription', 403));
  }

  subscription.status = 'cancelled';
  subscription.endDate = Date.now();
  await subscription.save();

  res.status(200).json({ success: true, data: subscription, message: 'Subscription cancelled' });
});