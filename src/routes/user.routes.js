const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { validate, userUpdateValidation } = require('../middlewares/validate.middleware');

// router.get('/', [verifyToken, isAdmin], userController.getAllUsers); // Admin only

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Mendapatkan data pengguna berdasarkan ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna
 *     responses:
 *       200:
 *         description: Data pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Pengguna tidak ditemukan
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     summary: Memperbarui data pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Data pengguna berhasil diperbarui
 *       400:
 *         description: Data yang dikirim tidak valid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.get('/:id', verifyToken, userController.getProfile);
router.put('/:id', [
  verifyToken,
  userUpdateValidation,
  validate
], userController.updateProfile);

// router.delete('/:id', [verifyToken, isAdmin], userController.deleteUser); // Admin only

/**
  * @swagger
  * /api/users/profile:
  *   get:
  *     summary: Mendapatkan data profil pengguna
  *     tags: [Users]
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: Data profil pengguna berhasil diambil
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/User'
  *       401:
  *         description: Unauthorized
  *
  *   put:
  *     summary: Memperbarui data profil pengguna
  *     tags: [Users]
  *     security:
  *       - bearerAuth: []
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               name:
  *                 type: string
  *               email:
  *                 type: string
  *                 format: email
  *     responses:
  *       200:
  *         description: Data profil pengguna berhasil diperbarui
  *       400:
  *         description: Data yang dikirim tidak valid
  *       401:
  *         description: Unauthorized
  */
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', [
  verifyToken,
  userUpdateValidation,
  validate
], userController.updateProfile);

module.exports = router;
