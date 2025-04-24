const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { verifyToken, authenticate } = require('../middlewares/auth.middleware');
const { validate, employeeValidationCreate, employeeValidationUpdate } = require('../middlewares/employee.middleware');
const upload = require('../middlewares/upload.middleware');

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
router.get('/', verifyToken, employeeController.getAllEmployee);
router.post('/', [upload.none(), verifyToken, employeeValidationCreate, validate],employeeController.createEmployee);

/**
 * @swagger
 * /api/employee/paginated:
 *   get:
 *     summary: Mendapatkan karyawan dengan paginasi
 *     tags: [Employee]
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
 *     responses:
 *       200:
 *         description: Karyawan berhasil ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get('/paginated', authenticate, employeeController.getEmployeesPaginated);

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
router.get('/:id', verifyToken, employeeController.getEmployeeById);
router.put('/:id', upload.none(), [verifyToken, employeeValidationUpdate, validate], employeeController.updateEmployee);
router.delete('/:id', verifyToken, employeeController.deleteEmployee);

module.exports = router;