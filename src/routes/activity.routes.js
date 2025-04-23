const express = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const activityController = require('../controllers/activity.controller');
const { activityValidation, validate, activityValidationSheet } = require('../middlewares/validate.middleware');
const router = express.Router();
const upload = require("../middlewares/upload.middleware");

/**
 * @swagger
 * /api/activity/getactivity/{id}:
 *   get:
 *     summary: Mendapatkan data aktivitas berdasarkan ID aktivitas
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID aktivitas
 *     responses:
 *       200:
 *         description: Data aktivitas berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Aktivitas tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get('/getactivity/:id', verifyToken, activityController.getByIdActivity);
router.get('/getactivity/', verifyToken, activityController.getAllActivity);
router.get('/idprogram/', verifyToken, activityController.getIdProgram);
router.get('/idactivity/', verifyToken, activityController.getIdAktivitas);

/**
 * @swagger
 * /api/activity/program/{id}:
 *   get:
 *     summary: Mendapatkan list aktivitas berdasarkan ID program
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID aktivitas
 *     responses:
 *       200:
 *         description: Data aktivitas berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Aktivitas tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get('/program/:id', verifyToken, activityController.getByIdProgram);

/**
 * @swagger
 * /api/activity/add:
 *   post:
 *     summary: Menambahkan aktivitas baru
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_aktivitas:
 *                 type: string
 *                 example: "Pelatihan Keterampilan Digital"
 *               deskripsi:
 *                 type: string
 *                 example: "Program ini bertujuan untuk meningkatkan keterampilan digital peserta."
 *               dokumentasi:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs for documentation
 *                 example: ["http://localhost:3000/uploads/dokumentasi1.jpg", "http://localhost:3000/uploads/dokumentasi2.jpg"]
 *               tanggal_mulai:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-01"
 *               tanggal_selesai:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-10"
 *               biaya_implementasi:
 *                 type: number
 *                 example: 5000000
 *               status:
 *                 type: string
 *                 enum: [Unstarted, Ongoing, Finished]
 *                 example: "Ongoing"
 *               program_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Aktivitas berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Aktivitas berhasil ditambahkan"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     nama_aktivitas:
 *                       type: string
 *                       example: "Pelatihan Keterampilan Digital"
 *                     deskripsi:
 *                       type: string
 *                       example: "Program ini bertujuan untuk meningkatkan keterampilan digital peserta."
 *                     dokumentasi:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["http://localhost:3000/uploads/dokumentasi1.jpg", "http://localhost:3000/uploads/dokumentasi2.jpg"]
 *                     tanggal_mulai:
 *                       type: string
 *                       format: date
 *                       example: "2025-04-01"
 *                     tanggal_selesai:
 *                       type: string
 *                       format: date
 *                       example: "2025-04-10"
 *                     biaya_implementasi:
 *                       type: number
 *                       example: 5000000
 *                     status:
 *                       type: string
 *                       example: "Ongoing"
 *                     program_id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request (validasi gagal)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post('/add', [verifyToken, upload.array('dokumentasi'), activityValidation, validate], activityController.addActivity);

/**
 * @swagger
 * /api/activity/delete/{id}:
 *   delete:
 *     summary: Menghapus aktivitas berdasarkan ID
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID aktivitas yang akan dihapus
 *     responses:
 *       200:
 *         description: Aktivitas berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Activity deleted successfully"
 *       403:
 *         description: Pengguna tidak diizinkan untuk menghapus aktivitas ini
 *       404:
 *         description: Aktivitas tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.delete('/delete/:id', verifyToken, activityController.deleteActivity);

/**
 * @swagger
 * /api/activity/update/{id}:
 *   put:
 *     summary: Update an activity by ID
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the activity to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_aktivitas:
 *                 type: string
 *               deskripsi:
 *                 type: string
 *               tanggal_mulai:
 *                 type: string
 *                 format: date
 *               tanggal_selesai:
 *                 type: string
 *                 format: date
 *               biaya_implementasi:
 *                 type: number
 *               status:
 *                 type: string
 *               program_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/update/:id', [verifyToken, upload.array('dokumentasi'), activityValidation, validate], activityController.updateActivity);

router.post('/add/sheet', verifyToken, activityController.addActivitySheet);

module.exports = router;
