const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createDeposit,
  confirmPayment,
  createWithdrawal,
  createTransfer,
  getTransactions,
} = require('../controllers/paymentController');

router.post('/deposit', protect, createDeposit);
router.post('/confirm', protect, confirmPayment);
router.post('/withdraw', protect, createWithdrawal);
router.post('/transfer', protect, createTransfer);
router.get('/transactions', protect, getTransactions);

module.exports = router;