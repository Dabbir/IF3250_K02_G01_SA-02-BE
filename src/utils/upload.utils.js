const cloudinary = require('../config/cloudinaryConfig');

/**
 * Ekstrak public_id dari URL Cloudinary
 * @param {string} url - URL file di Cloudinary
 * @returns {string|null} public_id atau null jika gagal
 */
const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Format URL Cloudinary: https://res.cloudinary.com/cloud_name/image/upload/v123456789/folder/filename.ext
    const regex = /\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
    const match = url.match(regex);
    
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};

/**
 * Hapus file dari Cloudinary berdasarkan public_id
 * @param {string} publicId - public_id file di Cloudinary
 * @returns {Promise<Object>} Hasil penghapusan
 */
const deleteFile = async (publicId) => {
  try {
    if (!publicId) throw new Error('Public ID is required');
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

/**
 * Hapus file dari Cloudinary berdasarkan URL
 * @param {string} url - URL file di Cloudinary
 * @returns {Promise<Object>} Hasil penghapusan
 */
const deleteFileByUrl = async (url) => {
  try {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) throw new Error('Could not extract public_id from URL');
    
    return await deleteFile(publicId);
  } catch (error) {
    console.error('Error deleting file by URL:', error);
    throw error;
  }
};

module.exports = {
  getPublicIdFromUrl,
  deleteFile,
  deleteFileByUrl
};