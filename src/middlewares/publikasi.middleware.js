const { body, validationResult } = require('express-validator');

exports.publikasiValidation = [
  body('judul_publikasi').notEmpty().withMessage('Title is required'),
  body('media_publikasi').notEmpty().withMessage('Description is required'),
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};