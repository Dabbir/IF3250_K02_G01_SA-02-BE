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
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 4 }).withMessage('Username must be at least 4 characters long')
    .isAlphanumeric().withMessage('Username must contain only alphanumeric characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('masjid_id')
    .optional()
    .isInt().withMessage('Masjid ID must be an integer')
];

exports.loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.logoutValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

exports.userUpdateValidation = [
  body('nama').optional().notEmpty().withMessage('Nama is required'),
  body('username')
    .optional()
    .isLength({ min: 4 }).withMessage('Username must be at least 4 characters long')
    .isAlphanumeric().withMessage('Username must contain only alphanumeric characters'),
  body('email')
    .optional()
    .isEmail().withMessage('Must be a valid email address'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('masjid_id')
    .optional()
    .isInt().withMessage('Masjid ID must be an integer')
];
