const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const systemRoutes = require('./system.route');
const blogRoutes = require('./blog.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/system', systemRoutes);
router.use('/blogs', blogRoutes);

module.exports = router;
