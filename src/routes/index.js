const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const publikasiRoutes = require('./publikasi.routes'); 
const activityRoutes = require('./activity.routes');
const accessRoutes = require('./access.routes');
const masjidRoutes = require('./masjid.routes');
const programRoutes = require('./program.routes');
const employeeRoutes = require('./employee.routes');

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/publikasi', publikasiRoutes); 
router.use('/activity', activityRoutes);
router.use('/access', accessRoutes);
router.use('/masjid', masjidRoutes);
router.use('/program', programRoutes);
router.use('/employee', employeeRoutes);

module.exports = router;