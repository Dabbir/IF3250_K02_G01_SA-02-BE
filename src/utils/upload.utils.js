const cloudinary = require('cloudinary').v2;

const getPublicIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    try {
        const regex = /\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
        const match = url.match(regex);
        
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting public_id from URL:', error);
        return null;
    }
};

const deleteCloudinaryImage = async (imageUrl) => {
    try {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (!publicId) {
            console.warn(`Could not extract public_id from URL: ${imageUrl}`);
            return false;
        }
        
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted image from Cloudinary: ${publicId}`, result);
        return result.result === 'ok';
    } catch (error) {
        console.error(`Error deleting image from Cloudinary: ${imageUrl}`, error);
        return false;
    }
};

module.exports = {
  getPublicIdFromUrl,
  deleteCloudinaryImage
}