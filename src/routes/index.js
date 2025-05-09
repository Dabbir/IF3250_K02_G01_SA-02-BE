const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const publicationRoutes = require('./publication.routes'); 
const activityRoutes = require('./activity.routes');
const accessRoutes = require('./access.routes');
const masjidRoutes = require('./masjid.routes');
const programRoutes = require('./program.routes');
const stakeholderRoutes = require('./stakeholder.routes');
const beneficiaryRoutes = require('./beneficiary.routes');
const galleryRoutes = require('./gallery.routes');
const employeeRoutes = require('./employee.routes');
const trainingRoutes = require('./training.routes');
const fileRoutes = require('./file.routes');

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/publication', publicationRoutes); 
router.use('/activity', activityRoutes);
router.use('/access', accessRoutes);
router.use('/files', fileRoutes);
router.use('/masjid', masjidRoutes);
router.use('/program', programRoutes);
router.use('/stakeholder', stakeholderRoutes);
router.use('/beneficiary', beneficiaryRoutes);
router.use('/gallery', galleryRoutes);
router.use('/employee', employeeRoutes);
router.use('/trainings', trainingRoutes);
router.use('/training', trainingRoutes);

module.exports = router;