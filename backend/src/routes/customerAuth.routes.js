const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/customerAuth.controller');
const { protectCustomer } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/verify-otp', ctrl.verifyOtp);
router.post('/reset-password', ctrl.resetPassword);
router.get('/profile', protectCustomer, ctrl.getProfile);
router.put('/profile', protectCustomer, ctrl.updateProfile);

module.exports = router;
