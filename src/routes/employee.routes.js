const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { verifyToken, authenticate } = require('../middlewares/auth.middleware');
const { validate, employeeValidationCreate, employeeValidationUpdate } = require('../middlewares/employee.middleware');
const { uploadFile } = require('../middlewares/cloud.middleware');

/**
 * @swagger
 * /api/employee:
 *   get:
 *     summary: Mendapatkan daftar karyawan
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar karyawan berhasil diambil
 *       500:
 *         description: Internal Server Error
 *
 *   post:
 *     summary: Menambahkan karyawan baru
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *               email:
 *                 type: string
 *               telepon:
 *                 type: string
 *               alamat:
 *                 type: string
 *               foto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Karyawan berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get('/', verifyToken, authenticate, employeeController.getAllEmployees);
router.post('/', [verifyToken, authenticate,
    uploadFile('image', 'foto', false), 
    (req, res, next) => {
      if (req.file) {
        req.fileUrl = req.file.path; 
        console.log("Uploaded profile photo:", req.fileUrl);
      }
      next();
    },
    employeeValidationCreate, 
    validate
], employeeController.createEmployee);

/**
 * @swagger
 * /api/employee/activity/{id}:
 *   get:
 *     summary: Mendapatkan aktivitas karyawan berdasarkan ID
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unik karyawan
 *     responses:
 *       200:
 *         description: Aktivitas karyawan berhasil diambil
 *       404:
 *         description: Karyawan tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get('/activity/:id', verifyToken, authenticate, employeeController.getActivityByEmployeeId);

/**
 * @swagger
 * /api/employee/{id}:
 *   get:
 *     summary: Mendapatkan karyawan berdasarkan ID
 *     tags: [Employee]
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
 *         description: Karyawan berhasil ditemukan
 *       404:
 *         description: Karyawan tidak ditemukan
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Memperbarui karyawan berdasarkan ID
 *     tags: [Employee]
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
 *               nama:
 *                 type: string
 *               email:
 *                 type: string
 *               telepon:
 *                 type: string
 *               alamat:
 *                 type: string
 *               foto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Karyawan berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Karyawan tidak ditemukan
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Menghapus karyawan berdasarkan ID
 *     tags: [Employee]
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
 *         description: Karyawan berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Karyawan tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', verifyToken, authenticate, employeeController.getEmployeeById);
router.put('/:id', [verifyToken, authenticate,
    uploadFile('image', 'foto', false),
    (req, res, next) => {
      if (req.file) {
        req.fileUrl = req.file.path;
        console.log("Updated profile photo:", req.fileUrl);
      }
      next();
    },
    employeeValidationUpdate, 
    validate
], employeeController.updateEmployee);
router.delete('/:id', verifyToken, authenticate, employeeController.deleteEmployee);

module.exports = router;