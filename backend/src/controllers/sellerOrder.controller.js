const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Seller = require('../models/Seller');
const { getIO } = require('../socket');

exports.getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = { 'items.seller': req.user._id };
  if (status) query['items.status'] = status;

  const orders = await Order.find(query)
    .sort('-createdAt').skip((page - 1) * limit).limit(+limit)
    .populate('customer', 'name email');

  const total = await Order.countDocuments(query);
  res.json({ success: true, orders, total });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingId } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.items.forEach(item => {
    if (item.seller.toString() === req.user._id.toString()) {
      item.status = status;
    }
  });

  if (trackingId) order.trackingId = trackingId;
  order.orderStatus = status;
  await order.save();

  await Notification.create({
    recipient: order.customer,
    recipientModel: 'Customer',
    type: 'order',
    title: 'Order Update',
    message: `Your order status updated to: ${status}`,
    link: `/customer/orders/${order._id}`,
  });

  getIO().to(`customer_${order.customer}`).emit('order_update', { orderId: order._id, status });

  res.json({ success: true, order });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const orders = await Order.find({ 'items.seller': sellerId });
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) =>
    sum + o.items.filter(i => i.seller.toString() === sellerId.toString())
      .reduce((s, i) => s + i.price * i.quantity, 0), 0);

  const seller = await Seller.findById(sellerId);
  res.json({ success: true, stats: { totalOrders, totalRevenue, withdrawableBalance: seller.withdrawableBalance } });
});
