const asyncHandler = require('../Middleware/asyncHandler');
const ErrorResponse = require('../Utils/errorResponse');
const { uploadMultiple, deleteFile } = require('../Services/cloudinaryService');

// @desc    Upload images
// @route   POST /api/upload
// @access  Private
exports.uploadImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one file', 400));
  }

  const uploadedFiles = await uploadMultiple(req.files);

  res.status(200).json({
    success: true,
    count: uploadedFiles.length,
    data: uploadedFiles,
  });
});

// @desc    Delete image
// @route   DELETE /api/upload/:publicId
// @access  Private
exports.deleteUpload = asyncHandler(async (req, res, next) => {
  const { publicId } = req.params;

  await deleteFile(publicId);

  res.status(200).json({ success: true, message: 'File deleted successfully' });
});