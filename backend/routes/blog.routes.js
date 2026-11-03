const express = require('express');
const router = express.Router();

const { getPublicBlogs, getPublicBlogBySlug, getBlogCategories, getBlogHighlights, likeBlog } = require('../controllers/blog.controller');
const { cacheMiddleware } = require('../services/cache.service');
const { engagementLimiter } = require('../middlewares/rateLimiter.middleware');
const live = { requiresLiveSync: true };

router.get('/categories', cacheMiddleware('blogs', 300, live), getBlogCategories);
router.get('/highlights', cacheMiddleware('blogs', 300, live), getBlogHighlights);
router.get('/', cacheMiddleware('blogs', 300, live), getPublicBlogs);
// Not cached: each read counts a view.
router.get('/:slug', getPublicBlogBySlug);
router.post('/:slug/like', engagementLimiter, likeBlog);

module.exports = router;
