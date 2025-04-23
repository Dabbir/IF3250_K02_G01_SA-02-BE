const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiary.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Apply auth middleware to all routes (optional, adjust based on your requirements)
router.use(authMiddleware.verifyToken);

// Create a new Beneficiary with file upload
router.post('/', 
  upload.single('foto'), 
  beneficiaryController.create
);

// Retrieve all Beneficiaries
router.get('/', beneficiaryController.findAll);

// Retrieve a single Beneficiary with id
router.get('/:id', beneficiaryController.findOne);

// Update a Beneficiary with id
router.put('/:id', 
  upload.single('foto'), 
  beneficiaryController.update
);

// Delete a Beneficiary with id
router.delete('/:id', beneficiaryController.delete);

// Get beneficiaries by aktivitas id
router.get('/aktivitas/:aktivitasId', beneficiaryController.findByAktivitas);

module.exports = router;