const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminAuth.controller');
const { protectAdmin } = require('../middleware/auth');

router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/verify-otp', ctrl.verifyOtp);
router.post('/reset-password', ctrl.resetPassword);
router.get('/profile', protectAdmin, ctrl.getProfile);

module.exports = router;
