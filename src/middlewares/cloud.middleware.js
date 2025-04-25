const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.config');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    if (file.fieldname === 'dokumenPendaftaran') {
      return {
        folder: 'salman/documents',
        resource_type: 'raw',
        format: 'pdf',
        public_id: `doc_${Date.now()}`,
        type: 'upload',
        access_mode: 'public',
        use_filename: true,
        unique_filename: true,
        overwrite: true,
        transformation: [
          { flags: "attachment" }
        ]
      };
    } else if (file.fieldname === 'fotoProfil') {
      return {
        folder: 'salman/images',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 500, height: 500, crop: 'limit' }
        ]
      };
    } else {
      return {
        folder: 'salman/others',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']
      };
    }
  }
});

const uploadFile = (resourceType, fieldName, multiple = false, maxCount = 10) => {
  const upload = multer({ 
    storage: storage,
    limits: { 
      fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'dokumenPendaftaran') {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Hanya file PDF yang diizinkan untuk dokumen pendaftaran'));
        }
      } else if (file.fieldname === 'fotoProfil') {
        if (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Format file tidak didukung. Gunakan format JPG, PNG, GIF, atau WEBP.'));
        }
      } else {
        cb(null, true);
      }
    }
  });

  const middleware = (req, res, next) => {
    const uploadMiddleware = multiple ? upload.array(fieldName, maxCount) : upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error(`Error uploading file (${fieldName}):`, err);
        return res.status(400).json({
          success: false,
          message: err.message || 'Terjadi kesalahan saat mengunggah file'
        });
      }
      
      if (req.file) {
        console.log(`File uploaded successfully (${fieldName}):`, {
          fieldname: req.file.fieldname,
          url: req.file.path,
          public_id: req.file.filename || req.file.public_id
        });
      } else if (req.files) {
        console.log(`Files uploaded successfully (${fieldName}):`, req.files.length);
      }
      
      next();
    });
  };

  return middleware;
};

const getEnhancedPdfUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') return cloudinaryUrl;
  
  if (cloudinaryUrl.includes('cloudinary.com') && 
      (cloudinaryUrl.includes('/raw/upload/') || cloudinaryUrl.endsWith('.pdf'))) {
    
    return cloudinaryUrl
      .replace('/raw/upload/', '/image/upload/fl_attachment/')
      .replace('/auto/upload/', '/image/upload/fl_attachment/');
  }
  
  return cloudinaryUrl;
};

module.exports = { 
  uploadFile,
  getEnhancedPdfUrl
};