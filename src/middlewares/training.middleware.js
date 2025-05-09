const { body, param, validationResult } = require('express-validator');
const { pool } = require('../config/db.config');

// Validation middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for creating/updating training
exports.trainingValidation = [
  body('nama_pelatihan')
    .notEmpty().withMessage('Nama pelatihan is required')
    .isLength({ max: 100 }).withMessage('Nama pelatihan cannot exceed 100 characters'),
  
  body('deskripsi')
    .optional()
    .isLength({ max: 2000 }).withMessage('Deskripsi cannot exceed 2000 characters'),
  
  body('waktu_mulai')
    .notEmpty().withMessage('Waktu mulai is required')
    .isISO8601().withMessage('Waktu mulai must be a valid date'),
  
  body('waktu_akhir')
    .notEmpty().withMessage('Waktu akhir is required')
    .isISO8601().withMessage('Waktu akhir must be a valid date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.waktu_mulai);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('Waktu akhir must be after waktu mulai');
      }
      return true;
    }),
  
  body('lokasi')
    .notEmpty().withMessage('Lokasi is required')
    .isLength({ max: 255 }).withMessage('Lokasi cannot exceed 255 characters'),
  
  body('kuota')
    .notEmpty().withMessage('Kuota is required')
    .isInt({ min: 1 }).withMessage('Kuota must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['Upcoming', 'Ongoing', 'Completed', 'Cancelled'])
    .withMessage('Status must be one of: Upcoming, Ongoing, Completed, Cancelled'),
  
  body('masjid_id')
    .notEmpty().withMessage('Masjid ID is required')
    .isInt().withMessage('Masjid ID must be an integer')
];

// Validation rules for ID parameter
exports.idValidation = [
  param('id')
    .isInt().withMessage('ID must be an integer')
];

// Validation rules for participant ID parameter
exports.participantIdValidation = [
  param('id')
    .isInt().withMessage('Training ID must be an integer'),
  param('participantId')
    .isInt().withMessage('Participant ID must be an integer')
];

// Validation rules for participant registration
exports.registrationValidation = [
  body('catatan')
    .optional()
    .isLength({ max: 1000 }).withMessage('Catatan cannot exceed 1000 characters')
];

// Validation rules for participant status update
exports.statusUpdateValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Pending', 'Approved', 'Rejected', 'Attended'])
    .withMessage('Status must be one of: Pending, Approved, Rejected, Attended'),
  
  body('catatan')
    .optional()
    .isLength({ max: 1000 }).withMessage('Catatan cannot exceed 1000 characters')
];

// Check if user belongs to the masjid that owns the training
exports.belongsToTrainingMasjid = async (req, res, next) => {
  try {
    // Skip for admin users - check both uppercase and lowercase versions
    if (req.user && (req.user.peran === 'Admin' || req.user.peran === 'admin')) {
      return next();
    }
    
    const trainingId = req.params.id;
    
    if (!trainingId) {
      return res.status(400).json({
        success: false,
        message: 'Training ID is required'
      });
    }
    
    // Get training data to check masjid_id
    const [rows] = await pool.query('SELECT masjid_id FROM pelatihan WHERE id = ?', [trainingId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }
    
    // Check if user has access to this masjid
    const trainingMasjidId = rows[0].masjid_id;
    
    if (req.user.masjid_id !== trainingMasjidId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this training'
      });
    }
    
    next();
  } catch (error) {
    console.error('Training permission check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during permission check'
    });
  }
};