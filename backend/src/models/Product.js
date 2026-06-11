const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  sku: { type: String, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: String,
  description: String,
  specifications: [{ key: String, value: String }],
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalPrice: Number,
  stock: { type: Number, default: 0 },
  images: [String],
  videos: [String],
  ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isFeatured: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: Number,
  flashSaleEnd: Date,
  tags: [String],
  totalSold: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.pre('save', function (next) {
  this.finalPrice = this.price - (this.price * this.discount) / 100;
  if (!this.slug) this.slug = this.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
