const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, sendOTP, verifyOTP } = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/sanitize');

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;