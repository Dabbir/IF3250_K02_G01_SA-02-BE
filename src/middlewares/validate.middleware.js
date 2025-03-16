const { validationResult, body } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.registerValidation = [
  body('nama').notEmpty().withMessage('Nama is required'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('masjid_id')
    .optional()
    .isInt().withMessage('Masjid ID must be an integer'),
  body('nama_masjid').optional()
];

exports.loginValidation = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.logoutValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

exports.userUpdateValidation = [
  body('nama').optional().notEmpty().withMessage('Nama is required'),
  body('email')
    .optional()
    .isEmail().withMessage('Must be a valid email address'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('masjid_id')
    .optional()
    .isInt().withMessage('Masjid ID must be an integer'),
  body('foto')
    .optional()
    .isString().withMessage('Foto must be a string'),
  body('short_bio').optional(),
  body('alasan_bergabung').optional(),
];
