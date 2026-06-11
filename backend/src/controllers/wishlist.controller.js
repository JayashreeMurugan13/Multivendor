const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ customer: req.user._id }).populate('products', 'name images finalPrice ratings seller');
  res.json({ success: true, wishlist: wishlist || { products: [] } });
});

exports.toggle = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ customer: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ customer: req.user._id, products: [] });

  const idx = wishlist.products.findIndex(id => id.toString() === productId);
  const action = idx > -1 ? 'removed' : 'added';
  if (idx > -1) wishlist.products.splice(idx, 1);
  else wishlist.products.push(productId);

  await wishlist.save();
  res.json({ success: true, action });
});
