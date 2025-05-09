const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const upload = require('../config/multer.config');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/:fileId', fileController.getFile);

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/', authenticate, fileController.listFiles);
router.delete('/:fileId', authenticate, fileController.deleteFile);

module.exports = router;