const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  amount: { type: Number, required: true },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolder: String,
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'processed'], default: 'pending' },
  adminNotes: String,
  processedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('WithdrawRequest', withdrawSchema);
