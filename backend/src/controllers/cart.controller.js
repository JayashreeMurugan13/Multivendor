const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const populateCart = (cartId) =>
  Cart.findById(cartId).populate('items.product', 'name images finalPrice price discount stock seller category slug');

exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ customer: req.user._id })
    .populate('items.product', 'name images finalPrice price discount stock seller category slug');
  if (!cart) cart = { items: [] };
  res.json({ success: true, cart });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || product.status !== 'approved') return res.status(404).json({ message: 'Product not available' });
  if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

  let cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) cart = new Cart({ customer: req.user._id, items: [] });

  const idx = cart.items.findIndex(i => i.product.toString() === productId);
  if (idx > -1) {
    cart.items[idx].quantity = quantity;
  } else {
    cart.items.push({ product: productId, quantity, price: product.finalPrice });
  }

  await cart.save();
  const populated = await populateCart(cart._id);
  res.json({ success: true, cart: populated });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  const populated = await populateCart(cart._id);
  res.json({ success: true, cart: populated });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ customer: req.user._id }, { items: [] });
  res.json({ success: true });
});

exports.applyCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
  if (!coupon) return res.status(400).json({ message: 'Invalid or expired coupon' });
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon usage limit reached' });
  if (coupon.usedBy?.includes(req.user._id)) return res.status(400).json({ message: 'Coupon already used' });
  if (cartTotal < coupon.minOrder) return res.status(400).json({ message: `Minimum order ₹${coupon.minOrder} required` });

  let discount = coupon.type === 'percentage' ? (cartTotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

  res.json({ success: true, discount });
});
