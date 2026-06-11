const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerApplication' },
  businessName: String,
  shopName: String,
  ownerName: String,
  phone: String,
  storeLogo: String,
  storeBanner: String,
  storeDescription: String,
  totalRevenue: { type: Number, default: 0 },
  withdrawableBalance: { type: Number, default: 0 },
  pendingPayments: { type: Number, default: 0 },
  refreshToken: { type: String, select: false },
  rejectionReason: String,
  approvedAt: Date,
}, { timestamps: true });

sellerSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

sellerSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Seller', sellerSchema);
