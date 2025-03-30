const { body, validationResult } = require('express-validator');

exports.programValidationCreate = [
  body('nama_program').notEmpty().withMessage("Program's name is required"),
];

exports.programValidationUpdate = [
  body().custom(value => {
    if (Object.keys(value).length === 0) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  }),
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