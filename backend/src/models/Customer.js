const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  phone: String,
  avatar: String,
  googleId: String,
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  wallet: { type: Number, default: 0 },
  rewardPoints: { type: Number, default: 0 },
  cashback: { type: Number, default: 0 },
  referralCode: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  refreshToken: { type: String, select: false },
}, { timestamps: true });

customerSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

customerSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);
