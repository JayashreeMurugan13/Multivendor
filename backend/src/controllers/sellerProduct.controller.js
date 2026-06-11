const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

exports.getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, search, sort, minPrice, maxPrice } = req.query;
  const query = { seller: req.user._id, status: { $ne: 'rejected' } };

  if (category) {
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const cat = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      query.category = cat?._id || null;
    }
  }
  if (search) query.name = { $regex: search, $options: 'i' };
  if (minPrice || maxPrice) query.finalPrice = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };

  const sortMap = { newest: '-createdAt', price_asc: 'finalPrice', price_desc: '-finalPrice', popular: '-totalSold' };
  const products = await Product.find(query)
    .sort(sortMap[sort] || '-createdAt')
    .skip((page - 1) * limit).limit(+limit)
    .populate('category', 'name');

  const total = await Product.countDocuments(query);
  res.json({ success: true, products, total, pages: Math.ceil(total / limit) });
});

const normalizeImageUrl = (p) => {
  if (!p) return p;
  if (p.startsWith('http')) return p;
  const filename = p.split(/[\\/]/).pop();
  return `http://localhost:${process.env.PORT || 5000}/uploads/${filename}`;
};

exports.createProduct = asyncHandler(async (req, res) => {
  const { specifications, category, ...rest } = req.body;
  const images = (req.files?.map(f => f.path) || []).map(normalizeImageUrl);

  let categoryId = category;
  if (category) {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(category)) {
      const cat = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      categoryId = cat?._id || null;
    }
  }

  const product = await Product.create({
    ...rest,
    category: categoryId,
    seller: req.user._id,
    images,
    specifications: specifications ? JSON.parse(specifications) : [],
    status: 'approved',
  });
  res.status(201).json({ success: true, product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const { specifications, ...rest } = req.body;
  Object.assign(product, rest);
  if (specifications) product.specifications = JSON.parse(specifications);
  if (req.files?.length) product.images = [...product.images, ...req.files.map(f => normalizeImageUrl(f.path))];
  // Keep approved status since seller is already verified
  await product.save();
  res.json({ success: true, product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
});

exports.deleteImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const publicId = imageUrl.split('/').pop().split('.')[0];
  await cloudinary.uploader.destroy(`buyzone/${publicId}`);
  product.images = product.images.filter(img => img !== imageUrl);
  await product.save();
  res.json({ success: true });
});
