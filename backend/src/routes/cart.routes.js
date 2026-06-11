const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cart.controller');
const { protectCustomer } = require('../middleware/auth');

router.use(protectCustomer);
router.get('/', ctrl.getCart);
router.post('/add', ctrl.addToCart);
router.delete('/remove/:productId', ctrl.removeFromCart);
router.delete('/clear', ctrl.clearCart);
router.post('/coupon', ctrl.applyCoupon);

module.exports = router;
