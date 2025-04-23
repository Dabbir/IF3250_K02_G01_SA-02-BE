const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiary.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// Create a new Beneficiary with file upload
router.post('/', 
  upload.single('foto'), 
  beneficiaryController.create
);

// Retrieve all Beneficiaries
router.get('/', beneficiaryController.findAll);

// Get beneficiaries by aktivitas id
router.get('/aktivitas/:aktivitasId', beneficiaryController.findByAktivitas);

// Retrieve a single Beneficiary with id
router.get('/:id', beneficiaryController.findOne);

// Update a Beneficiary with id
router.put('/:id', 
  upload.single('foto'), 
  beneficiaryController.update
);

// Delete a Beneficiary with id
router.delete('/:id', beneficiaryController.delete);

module.exports = router;