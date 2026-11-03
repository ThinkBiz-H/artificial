const express = require('express');
const router = express.Router();

const { getPublishedPages, getPublishedPageBySlug } = require('../controllers/page.controller');
const { cacheMiddleware } = require('../services/cache.service');
const live = { requiresLiveSync: true };

router.get('/', cacheMiddleware('pages', 600, live), getPublishedPages);
router.get('/:slug', cacheMiddleware('pages', 600, live), getPublishedPageBySlug);

module.exports = router;
