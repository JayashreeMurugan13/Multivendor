const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  image: { type: String, required: true },
  link: String,
  type: { type: String, enum: ['hero', 'promo', 'category'], default: 'hero' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  startsAt: Date,
  endsAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
