const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');

exports.getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, search, sort, minPrice, maxPrice, brand } = req.query;
  const query = { status: 'approved', stock: { $gt: 0 } };

  if (category) {
    // Support both ObjectId and category name string
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const cat = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      if (cat) query.category = cat._id;
      else query.category = null; // no match
    }
  }
  if (brand) query.brand = { $regex: brand, $options: 'i' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
    ];
  }
  if (minPrice || maxPrice) query.finalPrice = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };

  const sortMap = { newest: '-createdAt', price_asc: 'finalPrice', price_desc: '-finalPrice', popular: '-totalSold', rating: '-ratings.average' };
  const products = await Product.find(query)
    .sort(sortMap[sort] || '-createdAt')
    .skip((page - 1) * limit).limit(+limit)
    .populate('category', 'name slug')
    .populate('seller', 'shopName storeLogo');

  const total = await Product.countDocuments(query);
  res.json({ success: true, products, total, pages: Math.ceil(total / limit) });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'approved' })
    .populate('category', 'name')
    .populate('seller', 'shopName storeLogo storeDescription ratings');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ success: true, product });
});

exports.getFeatured = asyncHandler(async (req, res) => {
  const [trending, bestSellers, newArrivals, flashSales] = await Promise.all([
    Product.find({ status: 'approved', stock: { $gt: 0 } }).sort('-ratings.count').limit(10).populate('seller', 'shopName'),
    Product.find({ status: 'approved', stock: { $gt: 0 } }).sort('-totalSold').limit(10).populate('seller', 'shopName'),
    Product.find({ status: 'approved', stock: { $gt: 0 } }).sort('-createdAt').limit(10).populate('seller', 'shopName'),
    Product.find({ status: 'approved', isFlashSale: true, flashSaleEnd: { $gt: new Date() } }).limit(8).populate('seller', 'shopName'),
  ]);
  res.json({ success: true, trending, bestSellers, newArrivals, flashSales });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true, parent: null }).sort('sortOrder');
  res.json({ success: true, categories });
});

exports.getBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const banners = await Banner.find({
    isActive: true,
    $or: [{ endsAt: null }, { endsAt: { $gt: now } }],
  }).sort('sortOrder');
  res.json({ success: true, banners });
});
