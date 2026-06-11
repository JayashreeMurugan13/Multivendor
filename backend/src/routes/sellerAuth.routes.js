const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sellerAuth.controller');
const { protectSeller } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const docFields = upload.fields([
  { name: 'storeLogo', maxCount: 1 }, { name: 'storeBanner', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 }, { name: 'panCard', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 }, { name: 'cancelledCheque', maxCount: 1 },
]);

router.post('/register', docFields, ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/verify-otp', ctrl.verifyOtp);
router.post('/reset-password', ctrl.resetPassword);
router.get('/profile', protectSeller, ctrl.getProfile);
router.put('/profile', protectSeller, upload.single('storeLogo'), ctrl.updateProfile);

module.exports = router;
