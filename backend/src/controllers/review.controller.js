const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');

exports.addReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const images = req.files?.map(f => f.path) || [];

  const existing = await Review.findOne({ customer: req.user._id, product: productId });
  if (existing) return res.status(400).json({ message: 'Already reviewed this product' });

  const review = await Review.create({
    customer: req.user._id, product: productId,
    rating, title, comment, images, isVerifiedPurchase: true,
  });

  const reviews = await Review.find({ product: productId });
  const average = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, { 'ratings.average': average.toFixed(1), 'ratings.count': reviews.length });

  res.status(201).json({ success: true, review });
});

exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('customer', 'name avatar').sort('-createdAt');
  res.json({ success: true, reviews });
});

exports.markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  const idx = review.helpful.indexOf(req.user._id);
  if (idx > -1) review.helpful.splice(idx, 1);
  else review.helpful.push(req.user._id);
  await review.save();
  res.json({ success: true });
});
