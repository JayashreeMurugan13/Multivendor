const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const Seller = require('../models/Seller');
const { sendEmail, emailTemplates } = require('../utils/email');
const { getIO } = require('../socket');

// Lazy-init payment gateways only when keys are present
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID) return null;
  const Razorpay = require('razorpay');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

exports.createOrder = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod, couponCode, useWallet } = req.body;
  const cart = await Cart.findOne({ customer: req.user._id }).populate('items.product');
  if (!cart || !cart.items.length) return res.status(400).json({ message: 'Cart is empty' });

  let subtotal = 0;
  const items = [];
  for (const item of cart.items) {
    if (!item.product || item.product.status !== 'approved') continue;
    subtotal += item.product.finalPrice * item.quantity;
    items.push({
      product: item.product._id,
      seller: item.product.seller,
      name: item.product.name,
      image: item.product.images[0],
      price: item.product.finalPrice,
      quantity: item.quantity,
    });
  }

  const tax = Math.round(subtotal * 0.18);
  const shippingCharge = subtotal >= 500 ? 0 : 49;
  let discount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
    if (coupon) {
      discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      coupon.usedCount += 1;
      coupon.usedBy.push(req.user._id);
      await coupon.save();
    }
  }

  const total = subtotal + tax + shippingCharge - discount;

  const order = await Order.create({
    customer: req.user._id,
    items,
    address: req.body.address,
    subtotal, tax, shippingCharge, discount, total,
    couponCode, paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
  });

  // Update stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, totalSold: item.quantity } });
  }

  await Cart.findOneAndUpdate({ customer: req.user._id }, { items: [] });

  // Notify sellers
  const sellerIds = [...new Set(items.map(i => i.seller.toString()))];
  for (const sid of sellerIds) {
    await Notification.create({
      recipient: sid, recipientModel: 'Seller', type: 'order',
      title: 'New Order', message: `New order #${order._id}`,
      link: `/seller/orders/${order._id}`,
    });
    getIO().to(`seller_${sid}`).emit('new_order', { orderId: order._id });
    await Seller.findByIdAndUpdate(sid, { $inc: { pendingPayments: total } });
  }

  const tmpl = emailTemplates.orderPlaced(order._id);
  await sendEmail({ to: req.user.email, ...tmpl });

  if (paymentMethod === 'razorpay') {
    const razorpay = getRazorpay();
    if (!razorpay) {
      // Dummy mode: simulate Razorpay without real keys
      const dummyOrderId = 'order_dummy_' + Date.now();
      order.razorpayOrderId = dummyOrderId;
      order.paymentStatus = 'pending';
      await order.save();
      return res.json({
        success: true, order,
        razorpayOrder: { id: dummyOrderId, amount: total * 100, currency: 'INR' },
        key: 'rzp_test_dummy',
        dummy: true,
      });
    }
    const rpOrder = await razorpay.orders.create({ amount: total * 100, currency: 'INR', receipt: order._id.toString() });
    order.razorpayOrderId = rpOrder.id;
    await order.save();
    return res.json({ success: true, order, razorpayOrder: rpOrder, key: process.env.RAZORPAY_KEY_ID });
  }

  if (paymentMethod === 'stripe') {
    const stripe = getStripe();
    if (!stripe) return res.status(400).json({ message: 'Stripe not configured' });
    const intent = await stripe.paymentIntents.create({ amount: total * 100, currency: 'inr', metadata: { orderId: order._id.toString() } });
    order.stripePaymentIntentId = intent.id;
    await order.save();
    return res.json({ success: true, order, clientSecret: intent.client_secret });
  }

  res.status(201).json({ success: true, order });
});

exports.verifyRazorpay = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dummy } = req.body;

  if (dummy || razorpay_order_id?.startsWith('order_dummy_')) {
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = 'pay_dummy_' + Date.now();
    order.orderStatus = 'confirmed';
    await order.save();
    return res.json({ success: true, order });
  }

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(sign).digest('hex');
  if (expected !== razorpay_signature) return res.status(400).json({ message: 'Payment verification failed' });

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  order.orderStatus = 'confirmed';
  await order.save();
  res.json({ success: true, order });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort('-createdAt').populate('items.product', 'name images');
  res.json({ success: true, orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customer: req.user._id })
    .populate('items.product', 'name images finalPrice')
    .populate('items.seller', 'shopName');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ success: true, order });
});
