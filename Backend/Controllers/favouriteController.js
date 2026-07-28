const asyncHandler = require('../Middleware/asyncHandler');
const Favourite = require('../Models/Favourite');
const Property = require('../Models/Property');
const ErrorResponse = require('../Utils/errorResponse');

// @desc    Get user favourites
// @route   GET /api/favourites
// @access  Private
exports.getFavourites = asyncHandler(async (req, res, next) => {
  const favourites = await Favourite.find({ user: req.user.id }).populate('property', '-agent');
  res.status(200).json({ success: true, count: favourites.length, data: favourites });
});

// @desc    Add to favourites
// @route   POST /api/favourites/:propertyId
// @access  Private
exports.addToFavourites = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) return next(new ErrorResponse('Property not found', 404));

  const existingFavourite = await Favourite.findOne({
    user: req.user.id,
    property: req.params.propertyId,
  });

  if (existingFavourite) {
    return next(new ErrorResponse('Property already in favourites', 400));
  }

  const favourite = await Favourite.create({
    user: req.user.id,
    property: req.params.propertyId,
  });

  res.status(201).json({ success: true, data: favourite });
});

// @desc    Remove from favourites
// @route   DELETE /api/favourites/:propertyId
// @access  Private
exports.removeFromFavourites = asyncHandler(async (req, res, next) => {
  const favourite = await Favourite.findOne({
    user: req.user.id,
    property: req.params.propertyId,
  });

  if (!favourite) {
    return next(new ErrorResponse('Favourite not found', 404));
  }

  await favourite.deleteOne();
  res.status(200).json({ success: true, data: {}, message: 'Removed from favourites' });
});