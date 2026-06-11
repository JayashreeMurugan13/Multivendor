const mongoose = require('mongoose');

const sellerApplicationSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  businessName: { type: String, required: true },
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  gstNumber: String,
  panNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  documents: {
    gstCertificate: String,
    panCard: String,
    businessLicense: String,
    cancelledCheque: String,
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolder: String,
  },
  storeLogo: String,
  storeBanner: String,
  storeDescription: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'info_requested'],
    default: 'pending',
  },
  adminNotes: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  reviewedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('SellerApplication', sellerApplicationSchema);
