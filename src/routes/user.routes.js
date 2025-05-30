const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/access.middleware");
const {
  validate,
  userUpdateValidation,
} = require("../middlewares/validate.middleware");
const { uploadFile } = require("../middlewares/cloud.middleware");

router.get("/getall", verifyToken, isAdmin, userController.getAllUsers);

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
 *       500:
 *         description: Internal Server Error
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               short_bio:
 *                 type: string
 *                 nullable: true
 *               alasan_bergabung:
 *                 type: string
 *                 nullable: true
 *               fotoProfil:
 *                 type: string
 *                 format: binary
 *                 description: Foto profil pengguna (opsional)
 *               deleteProfileImage:
 *                 type: boolean
 *                 description: Jika true, foto profil akan dihapus
 *     responses:
 *       200:
 *         description: Data pengguna berhasil diperbarui
 *       400:
 *         description: Data yang dikirim tidak valid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Internal Server Error
 *
 * /api/users/photo/{filename}:
 *   get:
 *     summary: Mendapatkan foto profil pengguna
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nama file foto profil pengguna
 *     responses:
 *       200:
 *         description: Foto profil ditemukan dan dikirim sebagai respons
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Foto tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */

router.get("/", verifyToken, userController.getProfile);

router.put(
  "/",
  verifyToken,
  uploadFile('image', 'fotoProfil', false, 1),
  (req, res, next) => {
    if (req.files) {
      const fileUrls = req.files.map(file => file.path);
      req.fileUrls = fileUrls;
      console.log(req.fileUrls);
    }
    next();
  },
  userUpdateValidation,
  validate,
  userController.updateProfile
);

router.get("/photo/:filename", userController.getProfilePhoto);

router.put("/:id", uploadFile('document', 'dokumenPendaftaran', false, 1), userController.updateUser);

module.exports = router;