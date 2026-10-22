const express = require('express');
const router = express.Router();

const { getActiveCards } = require('../controllers/workshopCard.controller');
const { cacheMiddleware } = require('../services/cache.service');

router.get('/', cacheMiddleware('workshop-cards', 300), getActiveCards);

module.exports = router;
