const asyncHandler = require('express-async-handler');
const SellerApplication = require('../models/SellerApplication');
const Seller = require('../models/Seller');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const WithdrawRequest = require('../models/WithdrawRequest');
const { sendEmail, emailTemplates } = require('../utils/email');
const { getIO } = require('../socket');

exports.getDashboard = asyncHandler(async (req, res) => {
  const [customers, sellers, products, orders] = await Promise.all([
    Customer.countDocuments(),
    Seller.countDocuments({ status: 'approved' }),
    Product.countDocuments({ status: 'approved' }),
    Order.find({ paymentStatus: 'paid' }),
  ]);
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingApplications = await SellerApplication.countDocuments({ status: 'pending' });
  res.json({ success: true, stats: { customers, sellers, products, orders: orders.length, revenue, pendingApplications } });
});

// Seller Applications
exports.getApplications = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const apps = await SellerApplication.find({ status })
    .sort('-createdAt').skip((page - 1) * limit).limit(+limit);
  const total = await SellerApplication.countDocuments({ status });
  res.json({ success: true, applications: apps, total });
});

exports.getApplication = asyncHandler(async (req, res) => {
  const app = await SellerApplication.findById(req.params.id).populate('seller');
  if (!app) return res.status(404).json({ message: 'Application not found' });
  res.json({ success: true, application: app });
});

exports.reviewApplication = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const app = await SellerApplication.findById(req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found' });

  app.status = action;
  app.adminNotes = reason;
  app.reviewedBy = req.user._id;
  app.reviewedAt = new Date();
  await app.save();

  const seller = await Seller.findById(app.seller);
  seller.status = action === 'approved' ? 'approved' : 'rejected';
  if (action === 'rejected') seller.rejectionReason = reason;
  if (action === 'approved') seller.approvedAt = new Date();
  await seller.save();

  const tmpl = action === 'approved'
    ? emailTemplates.sellerApproved(app.ownerName)
    : emailTemplates.sellerRejected(app.ownerName, reason);
  await sendEmail({ to: app.email, ...tmpl });

  getIO().to(`seller_${seller._id}`).emit('application_reviewed', { status: action });
  res.json({ success: true, message: `Application ${action}` });
});

// Product Moderation
exports.getProducts = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const products = await Product.find({ status }).sort('-createdAt')
    .skip((page - 1) * limit).limit(+limit)
    .populate('seller', 'shopName').populate('category', 'name');
  const total = await Product.countDocuments({ status });
  res.json({ success: true, products, total });
});

exports.moderateProduct = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id, { status: action === 'approve' ? 'approved' : 'rejected' }, { new: true }
  );
  if (action === 'feature') await Product.findByIdAndUpdate(req.params.id, { isFeatured: true });
  res.json({ success: true, product });
});

// User Management
exports.getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find().sort('-createdAt');
  res.json({ success: true, customers });
});

exports.toggleCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  customer.isActive = !customer.isActive;
  await customer.save();
  res.json({ success: true, isActive: customer.isActive });
});

// Coupon Management
exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
});

exports.toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json({ success: true });
});

// Banner Management
exports.createBanner = asyncHandler(async (req, res) => {
  const image = req.file?.path;
  const banner = await Banner.create({ ...req.body, image });
  res.status(201).json({ success: true, banner });
});

exports.getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort('sortOrder');
  res.json({ success: true, banners });
});

exports.updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, banner });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Category Management
exports.createCategory = asyncHandler(async (req, res) => {
  const image = req.file?.path;
  const category = await Category.create({ ...req.body, image });
  res.status(201).json({ success: true, category });
});

// Orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { orderStatus: status } : {};
  const orders = await Order.find(query).sort('-createdAt')
    .skip((page - 1) * limit).limit(+limit)
    .populate('customer', 'name email');
  const total = await Order.countDocuments(query);
  res.json({ success: true, orders, total });
});

// Sellers
exports.getSellers = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const sellers = await Seller.find(query).sort('-createdAt');
  res.json({ success: true, sellers });
});

exports.toggleSeller = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  seller.status = seller.status === 'suspended' ? 'approved' : 'suspended';
  await seller.save();
  res.json({ success: true, status: seller.status });
});

// Withdrawals
exports.getWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await WithdrawRequest.find().populate('seller', 'shopName email').sort('-createdAt');
  res.json({ success: true, withdrawals });
});

exports.processWithdrawal = asyncHandler(async (req, res) => {
  const { action, adminNotes } = req.body;
  const wr = await WithdrawRequest.findByIdAndUpdate(
    req.params.id,
    { status: action, adminNotes, processedAt: new Date() },
    { new: true }
  );
  if (action === 'approved') {
    await Seller.findByIdAndUpdate(wr.seller, { $inc: { withdrawableBalance: -wr.amount } });
  }
  res.json({ success: true, withdrawal: wr });
});
