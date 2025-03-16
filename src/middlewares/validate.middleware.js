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
  body('nama')
    .optional()
    .notEmpty()
    .withMessage('Nama is required'),
  body('email')
    .optional()
    .notEmpty()
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('short_bio')
    .optional()
    .isLength({ min: 0, max: 300 })
    .withMessage('Short bio must be between 0 and 300 characters'),
  body('alasan_bergabung')
    .optional()
    .isLength({ min: 8, max: 100 })
    .withMessage('Alasan Bergabung must be between 8 and 100 characters'),
];
