const express = require('express');
const router = express.Router();
const programController = require('../controllers/program.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validate, programValidationCreate, programValidationUpdate } = require('../middlewares/program.middleware');
const upload = require("../middlewares/upload.middleware");
const { uploadFile } = require("../middlewares/cloud.middleware");
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/program:
 *   get:
 *     summary: Mendapatkan daftar program
 *     tags: [Program]
 *     responses:
 *       200:
 *         description: Daftar program berhasil diambil
 *       500:
 *         description: Internal Server Error
 *
 *   post:
 *     summary: Menambahkan program baru
 *     tags: [Program]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama_program:
 *                 type: string
 *               deskripsi_program:
 *                 type: string
 *               pilar_program:
 *                 type: string
 *               waktu_mulai:
 *                 type: date
 *               waktu_selesai:
 *                 type: date
 *               rancangan_anggaran:
 *                 type: float
 *               aktualisasi_anggaran:
 *                 type: float
 *               status_program:
 *                 type: string
 *     responses:
 *       201:
 *         description: Program berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get('/', authenticate, programController.getAllPrograms);
router.post('/', verifyToken, authenticate,
    uploadFile('image', 'cover_image', false),
    (req, res, next) => {
      if (req.file) req.fileUrl = req.file.path;
      next();
    },
    programValidationCreate,
    validate,
    programController.createProgram
  );

/**
 * @swagger
 * /api/program/{id}:
 *   get:
 *     summary: Mendapatkan program berdasarkan ID
 *     tags: [Program]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Program berhasil ditemukan
 *       404:
 *         description: Program tidak ditemukan
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Memperbarui program berdasarkan ID
 *     tags: [Program]
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
 *               nama_program:
 *                 type: string
 *               deskripsi_program:
 *                 type: string
 *               pilar_program:
 *                 type: string
 *               waktu_mulai:
 *                 type: date
 *               waktu_selesai:
 *                 type: date
 *               rancangan_anggaran:
 *                 type: float
 *               aktualisasi_anggaran:
 *                 type: float
 *               status_program:
 *                 type: string
 *     responses:
 *       200:
 *         description: Program berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Program tidak ditemukan
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Menghapus program berdasarkan ID
 *     tags: [Program]
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
 *         description: Program berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Program tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', verifyToken, authenticate, programController.getProgramById);
router.put('/:id', authenticate, verifyToken,
    uploadFile('image', 'cover_image', false),
    (req, res, next) => {
      if (req.file) req.fileUrl = req.file.path;
      next();
    },
    programValidationUpdate,
    validate,
    programController.updateProgram
  );
router.delete('/:id', verifyToken, authenticate, programController.deleteProgram);

module.exports = router;