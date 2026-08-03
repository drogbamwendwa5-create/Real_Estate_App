const multer = require('multer');
const ErrorResponse = require('../Utils/errorResponse');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

const singleUpload = upload.single('image');
const arrayUpload = upload.array('images', 10);
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) return cb(new ErrorResponse('Unsupported verification document type', 400), false);
    cb(null, true);
  }
});

const multipleUpload = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 3 },
]);

module.exports = { singleUpload, arrayUpload, multipleUpload, documentUpload };