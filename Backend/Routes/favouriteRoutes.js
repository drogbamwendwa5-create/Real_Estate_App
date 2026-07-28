const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth');
const { getFavourites, addToFavourites, removeFromFavourites } = require('../Controllers/favouriteController');

const { propertyIdValidation } = require('../Validators/favouriteValidators');
const validate = require('../Middleware/validation');

router.get('/', protect, getFavourites);
router.post('/:propertyId', protect, ...propertyIdValidation, validate, addToFavourites);
router.delete('/:propertyId', protect, ...propertyIdValidation, validate, removeFromFavourites);

module.exports = router;