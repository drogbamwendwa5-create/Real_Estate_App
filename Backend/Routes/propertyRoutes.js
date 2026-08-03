const express = require('express');
const router = express.Router();
const { protect, authorize, requireAnyPermission } = require('../Middleware/auth');
const { multipleUpload } = require('../Middleware/upload');
const validate = require('../Middleware/validation');
const { createPropertyValidation, updatePropertyValidation } = require('../Validators/propertyValidators');
const {
  getProperties, getProperty, createProperty, updateProperty, deleteProperty,
  getMyProperties, getFeaturedProperties, uploadPropertyImages, deletePropertyImage, toggleFeatured,
} = require('../Controllers/propertyController');

router.get('/', getProperties);
router.get('/my-properties', protect, getMyProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:id', getProperty);
router.post('/', protect, requireAnyPermission(['create-listings']), ...createPropertyValidation, validate, createProperty);
router.put('/:id', protect, requireAnyPermission(['edit-own-listings', 'manage-listings']), ...updatePropertyValidation, validate, updateProperty);
router.delete('/:id', protect, deleteProperty);
router.post('/:id/images', protect, multipleUpload, uploadPropertyImages);
router.delete('/:id/images/:imageId', protect, deletePropertyImage);
router.put('/:id/featured', protect, requireAnyPermission(['manage-listings']), toggleFeatured);

module.exports = router;