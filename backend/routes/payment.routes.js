const express = require('express');
const router = express.Router();

const {
  createIntent,
  confirmIntent,
  verifyPayment,
  paymentFailed,
  paymentCancelled,
  retryPayment,
  getOrderTransactions,
} = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/intent', createIntent);
router.post('/intent/confirm', confirmIntent);
router.post('/verify', verifyPayment);
router.post('/failure', paymentFailed);
router.post('/cancelled', paymentCancelled);
router.post('/:orderId/retry', retryPayment);
router.get('/:orderId/transactions', getOrderTransactions);

module.exports = router;
