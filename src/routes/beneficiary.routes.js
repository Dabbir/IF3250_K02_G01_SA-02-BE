const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiary.controller');
const { verifyToken, authenticate } = require('../middlewares/auth.middleware');
const { uploadFile } = require('../middlewares/cloud.middleware');
const { validateBeneficiary } = require('../middlewares/beneficiary.middleware');

/**
 * @swagger
 * tags:
 *   name: Beneficiary
 *   description: API untuk mengelola data beneficiary
 */

/**
 * @swagger
 * /api/beneficiary:
 *   post:
 *     summary: Menambahkan beneficiary baru
 *     tags: [Beneficiary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Beneficiary berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 *
 *   get:
 *     summary: Mendapatkan daftar semua beneficiary
 *     tags: [Beneficiary]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar beneficiary berhasil diambil
 *       500:
 *         description: Internal Server Error
 */
router.post('/', verifyToken, uploadFile('image', 'foto'), validateBeneficiary, beneficiaryController.create);
router.get('/', authenticate, beneficiaryController.findAll);

/**
 * @swagger
 * /api/beneficiary/aktivitas/{aktivitasId}:
 *   get:
 *     summary: Mendapatkan beneficiary berdasarkan ID aktivitas
 *     tags: [Beneficiary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: aktivitasId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data beneficiary berhasil ditemukan
 *       404:
 *         description: Data tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get('/aktivitas/:id', verifyToken, beneficiaryController.findByAktivitas);

/**
 * @swagger
 * /api/beneficiary/{id}:
 *   get:
 *     summary: Mendapatkan beneficiary berdasarkan ID
 *     tags: [Beneficiary]
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
 *         description: Beneficiary ditemukan
 *       404:
 *         description: Beneficiary tidak ditemukan
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Memperbarui data beneficiary berdasarkan ID
 *     tags: [Beneficiary]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Data beneficiary berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Beneficiary tidak ditemukan
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Menghapus beneficiary berdasarkan ID
 *     tags: [Beneficiary]
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
 *         description: Beneficiary berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Beneficiary tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', verifyToken, beneficiaryController.findOne);
router.put('/:id', verifyToken, uploadFile('image', 'foto'), validateBeneficiary, beneficiaryController.update);
router.delete('/:id', verifyToken, beneficiaryController.delete);

module.exports = router;