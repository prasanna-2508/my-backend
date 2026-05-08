const express = require('express');
const router = express.Router();
const {
  register,
  login,
  sendOTP,
  verifyOTPAndLogin,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidation,
  loginValidation,
  otpValidation,
  verifyOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middleware/validateMiddleware');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/send-otp', otpValidation, sendOTP);
router.post('/verify-otp', verifyOtpValidation, verifyOTPAndLogin);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;