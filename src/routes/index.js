const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const accessRoutes = require('./access.routes');

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/access', accessRoutes);

module.exports = router;
