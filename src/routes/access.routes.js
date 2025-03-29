const express = require('express');
const router = express.Router();
const accessController = require('../controllers/access.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const accessMiddleware = require('../middlewares/access.middleware');

router.use(authMiddleware.verifyToken);

/**
 * @swagger
 * tags:
 *   name: Admin Management
 *   description: Endpoint untuk manajemen approval editor oleh admin
 */

/**
 * @swagger
 * /api/access/editors/pending:
 *   get:
 *     summary: Mendapatkan daftar editor yang masih pending approval
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar editor berhasil diambil
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
 *                   example: Pending editors retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nama:
 *                         type: string
 *                       email:
 *                         type: string
 *                       peran:
 *                         type: string
 *                         example: Editor
 *                       status:
 *                         type: string
 *                         example: Pending
 *                       masjid_id:
 *                         type: integer
 *                       nama_masjid:
 *                         type: string
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 *       403:
 *         description: Tidak memiliki hak akses admin
 */
router.get(
  '/editors/pending',
  accessMiddleware.isAdmin,
  accessController.getPendingEditors
);

/**
 * @swagger
 * /api/access/editors/{editorId}/approve:
 *   put:
 *     summary: Menyetujui editor
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: editorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID editor yang akan disetujui
 *     responses:
 *       200:
 *         description: Editor berhasil disetujui
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
 *                   example: Editor approved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nama:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: Approved
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 *       403:
 *         description: Tidak memiliki hak akses admin
 *       404:
 *         description: Editor tidak ditemukan
 */
router.put(
  '/editors/:editorId/approve',
  accessMiddleware.isAdmin,
  accessController.approveEditor
);

/**
 * @swagger
 * /api/access/editors/{editorId}/reject:
 *   put:
 *     summary: Menolak editor
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: editorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID editor yang akan ditolak
 *     responses:
 *       200:
 *         description: Editor berhasil ditolak
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
 *                   example: Editor rejected successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nama:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: Rejected
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 *       403:
 *         description: Tidak memiliki hak akses admin
 *       404:
 *         description: Editor tidak ditemukan
 */
router.put(
  '/editors/:editorId/reject',
  accessMiddleware.isAdmin,
  accessController.rejectEditor
);

/**
 * @swagger
 * tags:
 *   name: Viewer Management
 *   description: Endpoint untuk manajemen akses viewer oleh editor
 */

/**
 * @swagger
 * /api/access/viewers/masjid/{masjidId}:
 *   get:
 *     summary: Mendapatkan daftar viewer yang sudah disetujui untuk suatu masjid
 *     tags: [Viewer Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: masjidId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID masjid
 *     responses:
 *       200:
 *         description: Daftar viewer berhasil diambil
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
 *                   example: Approved viewers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       viewer_nama:
 *                         type: string
 *                       viewer_email:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: Approved
 *                       expires_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 *       403:
 *         description: Tidak memiliki hak akses editor untuk masjid ini
 */
router.get(
  '/viewers/masjid/:masjidId',
  accessMiddleware.isEditorOfMasjid,
  accessController.getApprovedViewers
);

/**
 * @swagger
 * /api/access/viewers/pending/masjid/{masjidId}:
 *   get:
 *     summary: Mendapatkan daftar permintaan akses viewer yang pending
 *     tags: [Viewer Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: masjidId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID masjid
 *     responses:
 *       200:
 *         description: Daftar permintaan akses viewer berhasil diambil
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
 *                   example: Pending viewer requests retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       viewer_nama:
 *                         type: string
 *                       viewer_email:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: Pending
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 *       403:
 *         description: Tidak memiliki hak akses editor untuk masjid ini
 */
router.get(
  '/viewers/pending/masjid/:masjidId',
  accessMiddleware.isEditorOfMasjid,
  accessController.getPendingViewerRequests
);

/**
 * @swagger
 * /api/access/viewers/{requestId}/approve:
 *   put:
 *     summary: Menyetujui permintaan akses viewer
 *     tags: [Viewer Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID permintaan akses
 *     responses:
 *       200:
 *         description: Permintaan akses viewer berhasil disetujui
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
 *                   example: Viewer access request approved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 *       403:
 *         description: Tidak memiliki hak akses editor untuk masjid ini
 *       404:
 *         description: Permintaan akses tidak ditemukan
 */
router.put(
  '/viewers/:requestId/approve',
  accessMiddleware.isEditorOfMasjid,
  accessController.approveViewerRequest
);

/**
 * @swagger
 * /api/access/viewers/{requestId}/reject:
 *   put:
 *     summary: Menolak permintaan akses viewer
 *     tags: [Viewer Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID permintaan akses
 *     responses:
 *       200:
 *         description: Permintaan akses viewer berhasil ditolak
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
 *                   example: Viewer access request rejected successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 *       403:
 *         description: Tidak memiliki hak akses editor untuk masjid ini
 *       404:
 *         description: Permintaan akses tidak ditemukan
 */
router.put(
  '/viewers/:requestId/reject',
  accessMiddleware.isEditorOfMasjid,
  accessController.rejectViewerRequest
);

/**
 * @swagger
 * /api/access/viewers/{requestId}:
 *   delete:
 *     summary: Menghapus akses viewer
 *     tags: [Viewer Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID akses viewer
 *     responses:
 *       200:
 *         description: Akses viewer berhasil dihapus
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
 *                   example: Viewer access removed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 *       403:
 *         description: Tidak memiliki hak akses editor untuk masjid ini
 *       404:
 *         description: Akses viewer tidak ditemukan
 */
router.delete(
  '/viewers/:requestId',
  accessMiddleware.isEditorOfMasjid,
  accessController.removeViewerAccess
);

/**
 * @swagger
 * tags:
 *   name: Access Requests
 *   description: Endpoint untuk mengelola permintaan akses
 */

/**
 * @swagger
 * /api/access/viewers/request:
 *   post:
 *     summary: Meminta akses sebagai viewer ke masjid lain
 *     tags: [Access Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - masjidId
 *             properties:
 *               masjidId:
 *                 type: integer
 *                 description: ID masjid yang ingin diakses
 *     responses:
 *       200:
 *         description: Permintaan akses viewer berhasil dikirim
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
 *                   example: Viewer access request submitted successfully
 *       400:
 *         description: Data yang dikirim tidak valid
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 *       403:
 *         description: Pengguna bukan editor yang sudah disetujui
 */
router.post(
  '/viewers/request',
  accessMiddleware.isApprovedEditor,
  accessController.requestViewerAccess
);

/**
 * @swagger
 * /api/access/masjids:
 *   get:
 *     summary: Mendapatkan daftar masjid yang dapat diakses oleh pengguna
 *     tags: [Access Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar masjid berhasil diambil
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
 *                   example: Accessible masjids retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nama_masjid:
 *                         type: string
 *                       alamat:
 *                         type: string
 *                       access_type:
 *                         type: string
 *                         enum: [Editor, Viewer]
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 */
router.get(
  '/masjids',
  accessController.getAccessibleMasjids
);

/**
 * @swagger
 * tags:
 *   name: Access Checks
 *   description: Endpoint untuk memeriksa hak akses
 */

/**
 * @swagger
 * /api/access/check/viewer/{masjidId}:
 *   get:
 *     summary: Memeriksa apakah pengguna memiliki akses viewer ke masjid
 *     tags: [Access Checks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: masjidId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID masjid
 *     responses:
 *       200:
 *         description: Status akses berhasil diperiksa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 hasAccess:
 *                   type: boolean
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 */
router.get(
  '/check/viewer/:masjidId',
  accessController.checkViewerAccess
);

/**
 * @swagger
 * /api/access/check/editor/{masjidId}:
 *   get:
 *     summary: Memeriksa apakah pengguna memiliki akses editor ke masjid
 *     tags: [Access Checks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: masjidId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID masjid
 *     responses:
 *       200:
 *         description: Status akses berhasil diperiksa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 hasAccess:
 *                   type: boolean
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 */
router.get(
  '/check/editor/:masjidId',
  accessController.checkEditorAccess
);

module.exports = router;