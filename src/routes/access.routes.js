const express = require('express');
const router = express.Router();
const accessController = require('../controllers/access.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const accessMiddleware = require('../middlewares/access.middleware');

router.use(authMiddleware.verifyToken);

// ----------------------------------------
// Admin - Manajemen Approval Editor
// ----------------------------------------

// Mendapatkan daftar editor yang masih pending approval
router.get(
  '/editors/pending',
  accessMiddleware.isAdmin,
  accessController.getPendingEditors
);

// Menyetujui editor
router.put(
  '/editors/:editorId/approve',
  accessMiddleware.isAdmin,
  accessController.approveEditor
);

// Menolak editor
router.put(
  '/editors/:editorId/reject',
  accessMiddleware.isAdmin,
  accessController.rejectEditor
);

// ----------------------------------------
// Editor - Manajemen Akses Viewer
// ----------------------------------------

// Mendapatkan daftar viewer yang sudah disetujui untuk suatu masjid
router.get(
  '/viewers/masjid/:masjidId',
  accessMiddleware.isEditorOfMasjid,
  accessController.getApprovedViewers
);

// Mendapatkan daftar permintaan akses viewer yang pending
router.get(
  '/viewers/pending/masjid/:masjidId',
  accessMiddleware.isEditorOfMasjid,
  accessController.getPendingViewerRequests
);

// Menyetujui permintaan akses viewer
router.put(
  '/viewers/:requestId/approve',
  accessMiddleware.isEditorOfMasjid,
  accessController.approveViewerRequest
);

// Menolak permintaan akses viewer
router.put(
  '/viewers/:requestId/reject',
  accessMiddleware.isEditorOfMasjid,
  accessController.rejectViewerRequest
);

// Menghapus akses viewer
router.delete(
  '/viewers/:requestId',
  accessMiddleware.isEditorOfMasjid,
  accessController.removeViewerAccess
);

// ----------------------------------------
// Pengguna - Permintaan Akses Viewer
// ----------------------------------------

// Meminta akses sebagai viewer ke masjid lain
router.post(
  '/viewers/request',
  accessMiddleware.isApprovedEditor,
  accessController.requestViewerAccess
);

// Mendapatkan daftar masjid yang dapat diakses oleh pengguna
router.get(
  '/masjids',
  accessController.getAccessibleMasjids
);

// ----------------------------------------
// Pemeriksaan Akses
// ----------------------------------------

// Memeriksa apakah pengguna memiliki akses viewer ke masjid
router.get(
  '/check/viewer/:masjidId',
  accessController.checkViewerAccess
);

// Memeriksa apakah pengguna memiliki akses editor ke masjid
router.get(
  '/check/editor/:masjidId',
  accessController.checkEditorAccess
);

module.exports = router;