const express = require('express');
const router = express.Router();
const { requireFeature } = require('../middlewares/featureFlag.middleware');

const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  moveToCart,
} = require('../controllers/wishlist.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', getWishlist);
router.post('/:productId', requireFeature('wishlist', 'Wishlist is currently unavailable.'), addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.post('/:productId/move-to-cart', moveToCart);

module.exports = router;
