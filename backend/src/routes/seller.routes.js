const express = require('express');
const router = express.Router();
const pCtrl = require('../controllers/sellerProduct.controller');
const oCtrl = require('../controllers/sellerOrder.controller');
const { protectSeller } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(protectSeller);

// Dashboard
router.get('/dashboard', oCtrl.getDashboard);

// Products
router.get('/products', pCtrl.getProducts);
router.post('/products', ...upload.array('images', 10), pCtrl.createProduct);
router.put('/products/:id', ...upload.array('images', 10), pCtrl.updateProduct);
router.delete('/products/:id', pCtrl.deleteProduct);
router.post('/products/:id/delete-image', pCtrl.deleteImage);

// Orders
router.get('/orders', oCtrl.getOrders);
router.put('/orders/:id/status', oCtrl.updateOrderStatus);

// Withdrawals
const WithdrawRequest = require('../models/WithdrawRequest');
const Seller = require('../models/Seller');
const asyncHandler = require('express-async-handler');

router.get('/withdrawals', asyncHandler(async (req, res) => {
  const withdrawals = await WithdrawRequest.find({ seller: req.user._id }).sort('-createdAt');
  res.json({ success: true, withdrawals });
}));

router.post('/withdrawals', asyncHandler(async (req, res) => {
  const { amount, notes } = req.body;
  const seller = await Seller.findById(req.user._id);
  if (amount > seller.withdrawableBalance) return res.status(400).json({ message: 'Insufficient balance' });
  const wr = await WithdrawRequest.create({ seller: req.user._id, amount, notes });
  res.status(201).json({ success: true, withdrawal: wr });
}));

module.exports = router;
