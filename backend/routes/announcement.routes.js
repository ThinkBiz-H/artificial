const express = require('express');
const router = express.Router();

const { getActiveAnnouncements } = require('../controllers/announcement.controller');
const { cacheMiddleware } = require('../services/cache.service');

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Active announcement-marquee messages, sorted for display
 *     tags: [Announcements]
 *     security: []
 *     responses:
 *       200: { description: Active announcements }
 */
router.get('/', cacheMiddleware('announcements', 300), getActiveAnnouncements);

module.exports = router;
