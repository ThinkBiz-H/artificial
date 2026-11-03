const express = require('express');
const router = express.Router();

const { getPublicSettings } = require('../controllers/settings.controller');
const { cacheMiddleware } = require('../services/cache.service');

router.get('/', cacheMiddleware('settings', 300), getPublicSettings);
// Brand Management payload (logos, theme, company, social) — website, app and admin.
router.get('/brand', cacheMiddleware('brand-settings', 300), require('../controllers/brandSettings.controller').getPublicBrand);

module.exports = router;
