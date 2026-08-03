const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth');
const validate = require('../Middleware/validation');
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, updatePasswordValidation, deleteAccountValidation } = require('../Validators/authValidators');
const {
  register, login, refresh, logout, forgotPassword, resetPassword,
  updatePassword, verifyEmail, getMe, updateDetails, deleteAccount,
} = require('../Controllers/authController');

router.post('/register', ...registerValidation, validate, register);
router.post('/login', ...loginValidation, validate, login);
router.post('/refresh', refresh);
router.get('/logout', logout);
router.post('/forgot-password', ...forgotPasswordValidation, validate, forgotPassword);
router.put('/reset-password/:token', ...resetPasswordValidation, validate, resetPassword);
router.put('/update-password', protect, ...updatePasswordValidation, validate, updatePassword);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.delete('/delete-account', protect, ...deleteAccountValidation, validate, deleteAccount);

module.exports = router;