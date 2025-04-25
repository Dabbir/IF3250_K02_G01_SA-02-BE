const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.config');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'salman',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
});

const uploadFile = (type, fieldName, multiple = false, maxCount = 10) => {
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
  });

  if (multiple) {
    return upload.array(fieldName, maxCount);
  } else {
    return upload.single(fieldName);
  }
};

module.exports = { uploadFile };