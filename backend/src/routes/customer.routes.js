const express = require('express');
const router = express.Router();
const rCtrl = require('../controllers/review.controller');
const wCtrl = require('../controllers/wishlist.controller');
const aCtrl = require('../controllers/address.controller');
const Notification = require('../models/Notification');
const Address = require('../models/Address');
const Wishlist = require('../models/Wishlist');
const asyncHandler = require('express-async-handler');
const { protectCustomer } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(protectCustomer);

// Reviews
router.post('/reviews', upload.array('images', 5), rCtrl.addReview);
router.get('/reviews/:productId', rCtrl.getProductReviews);
router.put('/reviews/:id/helpful', rCtrl.markHelpful);

// Wishlist
router.get('/wishlist', wCtrl.getWishlist);
router.post('/wishlist', asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ customer: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ customer: req.user._id, products: [] });
  if (!wishlist.products.map(String).includes(String(productId))) wishlist.products.push(productId);
  await wishlist.save();
  res.json({ success: true });
}));
router.post('/wishlist/toggle', wCtrl.toggle);

// Addresses
router.get('/addresses', aCtrl.getAddresses);
router.post('/addresses', aCtrl.addAddress);
router.put('/addresses/:id/default', asyncHandler(async (req, res) => {
  await Address.updateMany({ customer: req.user._id }, { isDefault: false });
  const addr = await Address.findOneAndUpdate(
    { _id: req.params.id, customer: req.user._id },
    { isDefault: true },
    { new: true }
  );
  res.json({ success: true, address: addr });
}));
router.put('/addresses/:id', aCtrl.updateAddress);
router.delete('/addresses/:id', aCtrl.deleteAddress);

// Notifications
router.get('/notifications', asyncHandler(async (req, res) => {
  const notifs = await Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(50);
  res.json({ success: true, notifications: notifs });
}));

router.put('/notifications/read-all', asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
  res.json({ success: true });
}));

module.exports = router;
