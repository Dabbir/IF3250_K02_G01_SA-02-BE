const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const programRoutes = require('./program.routes');

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/program', programRoutes);

module.exports = router;
