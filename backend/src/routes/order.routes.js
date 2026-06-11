const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/order.controller');
const { protectCustomer } = require('../middleware/auth');

router.use(protectCustomer);
router.post('/', ctrl.createOrder);
router.post('/verify-razorpay', ctrl.verifyRazorpay);
router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrder);

module.exports = router;
