const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer (from multer memoryStorage) to Cloudinary via
 * an upload stream, since we never write the file to disk.
 */
const uploadBufferToCloudinary = (buffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete failed:', err.message);
  }
};

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary };
