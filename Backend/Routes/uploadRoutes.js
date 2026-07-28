const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth');
const { singleUpload, arrayUpload } = require('../Middleware/upload');
const { uploadImages, deleteUpload } = require('../Controllers/uploadController');

router.post('/', protect, arrayUpload, uploadImages);
router.delete('/:publicId', protect, deleteUpload);

module.exports = router;