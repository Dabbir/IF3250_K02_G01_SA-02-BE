const { body, validationResult } = require('express-validator');

exports.employeeValidationCreate = [
    body('nama')
    .notEmpty().withMessage("Employee's name is required")
    .bail()
    .isString().withMessage("Employee's name must be a string"),

    body('email')
    .notEmpty().withMessage("Employee's email is required")
    .bail()
    .isEmail().withMessage('Invalid email format'),

    body('telepon')
    .notEmpty().withMessage("Employee's phone number is required")
    .bail()
    .isMobilePhone('any').withMessage('Invalid phone number'),

    body('alamat')
    .optional().isString().withMessage('Invalid address'),

    body('foto')
    .optional().isString().withMessage('Invalid photo URL'),
];

exports.employeeValidationUpdate = [
    body().custom(value => {
      if (Object.keys(value).length === 0) {
        throw new Error('At least one field must be provided for update');
      }
      return true;
    }),

    body('nama')
    .optional().isString().withMessage("Employee's name must be a string"),

    body('email').optional().isEmail().withMessage('Invalid email format'),

    body('telepon')
    .optional().isMobilePhone('any').withMessage('Invalid phone number'),

    body('alamat')
    .optional().isString().withMessage('Invalid address'),

    body('foto')
    .optional().isString().withMessage('Invalid photo URL'),
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
