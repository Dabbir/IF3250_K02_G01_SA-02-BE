const express = require('express');
const router = express.Router();
const publikasiController = require('../controllers/publikasi.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { validate, publikasiValidation } = require('../middlewares/publikasi.middleware');
const upload = require("../middlewares/upload.middleware");

/**
 * @swagger
 * /api/publikasi:
 *   get:
 *     summary: Mendapatkan daftar publikasi
 *     tags: [Publikasi]
 *     responses:
 *       200:
 *         description: Daftar publikasi berhasil diambil
 *       500:
 *         description: Internal Server Error
 *
 *   post:
 *     summary: Menambahkan publikasi baru
 *     tags: [Publikasi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Publikasi berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get('/', publikasiController.getAllPublikasi);
router.post('/', [verifyToken, upload.single("file"), publikasiValidation, validate], publikasiController.createPublikasi);

/**
 * @swagger
 * /api/publikasi/{id}:
 *   get:
 *     summary: Mendapatkan publikasi berdasarkan ID
 *     tags: [Publikasi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publikasi berhasil ditemukan
 *       404:
 *         description: Publikasi tidak ditemukan
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Memperbarui publikasi berdasarkan ID
 *     tags: [Publikasi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Publikasi berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Publikasi tidak ditemukan
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Menghapus publikasi berdasarkan ID
 *     tags: [Publikasi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publikasi berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Publikasi tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', publikasiController.getPublikasiById);
router.put('/:id', [verifyToken, publikasiValidation, validate], publikasiController.updatePublikasi);
router.delete('/:id', [verifyToken, publikasiValidation], publikasiController.deletePublikasi);

module.exports = router;