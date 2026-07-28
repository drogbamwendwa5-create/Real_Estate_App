const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadStream = (fileBuffer, folder = 'real-estate') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const uploadMultiple = async (files) => {
  const uploadPromises = files.map(file => uploadStream(file.buffer || file));
  return Promise.all(uploadPromises);
};

const deleteFile = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadStream, uploadMultiple, deleteFile };