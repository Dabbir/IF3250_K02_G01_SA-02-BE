const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, registerValidation, loginValidation } = require('../middlewares/validate.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/register', [
  registerValidation,
  validate
], authController.register);

router.post('/login', [
  loginValidation,
  validate
], authController.login);

router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;
