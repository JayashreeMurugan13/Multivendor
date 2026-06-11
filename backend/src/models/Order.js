const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'placed',
  },
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [orderItemSchema],
  address: {
    name: String, phone: String, street: String,
    city: String, state: String, country: String, postalCode: String,
  },
  subtotal: Number,
  shippingCharge: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: Number,
  couponCode: String,
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'cod', 'wallet'],
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  stripePaymentIntentId: String,
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },
  trackingId: String,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
