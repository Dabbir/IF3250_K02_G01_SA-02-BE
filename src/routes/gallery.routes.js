// routes/gallery.routes.js
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const { verifyToken, authenticate } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/gallery:
 *   get:
 *     summary: Mendapatkan semua foto galeri dari semua aktivitas
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Galeri berhasil diambil
 *       500:
 *         description: Internal Server Error
 */
router.get('/', verifyToken, galleryController.getAllGallery);

/**
 * @swagger
 * /api/gallery/paginated:
 *   get:
 *     summary: Mendapatkan foto galeri dengan paginasi
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Galeri (paginated) berhasil diambil
 *       500:
 *         description: Internal Server Error
 */
router.get('/paginated', authenticate, galleryController.getGalleryPaginated);

/**
 * @swagger
 * /api/gallery/{id}:
 *   get:
 *     summary: Mendapatkan foto galeri berdasarkan ID aktivitas
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Foto galeri aktivitas berhasil diambil
 *       404:
 *         description: Aktivitas tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', verifyToken, galleryController.getGalleryByAktivitasId);

module.exports = router;