const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const { protectAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(protectAdmin);

router.get('/dashboard', ctrl.getDashboard);

// Seller Applications — support both /applications and /sellers/applications
router.get('/applications', ctrl.getApplications);
router.get('/applications/:id', ctrl.getApplication);
router.put('/applications/:id/review', ctrl.reviewApplication);
router.get('/sellers/applications', ctrl.getApplications);
router.put('/sellers/applications/:id/review', ctrl.reviewApplication);

// Products
router.get('/products', ctrl.getProducts);
router.put('/products/:id/moderate', ctrl.moderateProduct);

// Customers
router.get('/customers', ctrl.getCustomers);
router.put('/customers/:id/toggle', ctrl.toggleCustomer);

// Sellers
router.get('/sellers', ctrl.getSellers);
router.put('/sellers/:id/toggle', ctrl.toggleSeller);

// Orders
router.get('/orders', ctrl.getAllOrders);

// Coupons
router.post('/coupons', ctrl.createCoupon);
router.get('/coupons', ctrl.getCoupons);
router.put('/coupons/:id/toggle', ctrl.toggleCoupon);

// Banners
router.post('/banners', upload.single('image'), ctrl.createBanner);
router.get('/banners', ctrl.getBanners);
router.put('/banners/:id', ctrl.updateBanner);
router.delete('/banners/:id', ctrl.deleteBanner);

// Categories
router.post('/categories', upload.single('image'), ctrl.createCategory);

// Withdrawals
router.get('/withdrawals', ctrl.getWithdrawals);
router.put('/withdrawals/:id', ctrl.processWithdrawal);

module.exports = router;
