const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const publikasiRoutes = require('./publikasi.routes'); 

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/publikasi', publikasiRoutes); 

module.exports = router;