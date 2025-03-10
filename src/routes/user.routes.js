const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { validate, userUpdateValidation } = require('../middlewares/validate.middleware');

// router.get('/', [verifyToken, isAdmin], userController.getAllUsers); // Admin only
router.get('/:id', verifyToken, userController.getUserById);

router.put('/:id', [
  verifyToken,
  userUpdateValidation,
  validate
], userController.updateUser);

// router.delete('/:id', [verifyToken, isAdmin], userController.deleteUser); // Admin only

module.exports = router;
