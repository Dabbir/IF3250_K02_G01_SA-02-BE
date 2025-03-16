const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  validate,
  registerValidation,
  loginValidation,
} = require("../middlewares/validate.middleware");
const { verifyToken, destroyToken, redirectIfAuthenticated, googleAuth, googleAuthCallback } = require("../middlewares/auth.middleware");

// Auth routes

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Mendaftarkan pengguna baru
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Pengguna berhasil terdaftar
 *       400:
 *         description: Data yang dikirim tidak valid
 */
router.post("/register", [registerValidation, validate], authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Email atau password tidak valid
 */
router.post("/login", [redirectIfAuthenticated, loginValidation, validate], authController.login);

router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback, authController.callback);
router.get('/me', verifyToken, authController.me);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout pengguna
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", destroyToken, authController.logout);

module.exports = router;
