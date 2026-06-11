const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const SellerApplication = require('../models/SellerApplication');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const { sendTokens, generateAccessToken } = require('../utils/jwt');
const { sendEmail, emailTemplates } = require('../utils/email');

const otpStore = new Map();


exports.register = asyncHandler(async (req, res) => {
  const {
    businessName, shopName, ownerName, email, phone,
    gstNumber, panNumber, address, bankDetails, storeDescription, password,
  } = req.body;

  const exists = await Seller.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const docs = req.files || {};
  const getUrl = (field) => docs[field]?.[0]?.path || '';

  const application = await SellerApplication.create({
    businessName, shopName, ownerName, email, phone,
    gstNumber, panNumber, address: JSON.parse(address || '{}'),
    bankDetails: JSON.parse(bankDetails || '{}'),
    storeDescription,
    storeLogo: getUrl('storeLogo'),
    storeBanner: getUrl('storeBanner'),
    documents: {
      gstCertificate: getUrl('gstCertificate'),
      panCard: getUrl('panCard'),
      businessLicense: getUrl('businessLicense'),
      cancelledCheque: getUrl('cancelledCheque'),
    },
  });

  const seller = await Seller.create({
    email, password, businessName, shopName, ownerName, phone,
    storeLogo: application.storeLogo,
    storeBanner: application.storeBanner,
    storeDescription,
    application: application._id,
  });

  application.seller = seller._id;
  await application.save();

  // Notify admins (non-blocking)
  try {
    const admin = await Admin.findOne({});
    if (admin) {
      await Notification.create({
        recipient: admin._id,
        recipientModel: 'Admin',
        type: 'seller_application',
        title: 'New Seller Application',
        message: `${businessName} has submitted a seller application`,
        link: `/admin/sellers/applications/${application._id}`,
      });
    }
  } catch {}

  try {
    const tmpl = emailTemplates.sellerApplicationReceived(ownerName);
    await sendEmail({ to: email, ...tmpl });
  } catch {}

  res.status(201).json({
    success: true,
    message: 'Application submitted. Awaiting admin approval.',
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const seller = await Seller.findOne({ email }).select('+password');

  if (!seller || !(await seller.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (seller.status === 'pending') {
    return res.status(403).json({ message: 'Application under review' });
  }
  if (seller.status === 'rejected') {
    return res.status(403).json({ message: `Application rejected: ${seller.rejectionReason}` });
  }
  if (seller.status === 'suspended') {
    return res.status(403).json({ message: 'Account suspended' });
  }

  sendTokens(res, seller, 'seller');
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const seller = await Seller.findById(decoded.id);
  if (!seller) return res.status(401).json({ message: 'Invalid token' });
  const accessToken = generateAccessToken(seller._id, 'seller');
  res.json({ success: true, accessToken });
});

exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true });
};

exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, seller: req.user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const updates = (({ shopName, storeDescription, phone }) => ({ shopName, storeDescription, phone }))(req.body);
  if (req.file) updates.storeLogo = req.file.path;
  const seller = await Seller.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ success: true, seller });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const seller = await Seller.findOne({ email });
  if (!seller) return res.status(404).json({ message: 'Email not registered' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expiry: Date.now() + 10 * 60 * 1000 });
  await sendEmail({ to: email, subject: 'Seller Password Reset OTP - BUYZONE', html: `<h2>Password Reset</h2><p>OTP: <strong style="font-size:24px">${otp}</strong></p><p>Valid for 10 minutes.</p>` });
  res.json({ success: true, message: 'OTP sent to your email' });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);
  if (!record || record.otp !== otp || Date.now() > record.expiry)
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  res.json({ success: true, message: 'OTP verified' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const record = otpStore.get(email);
  if (!record || record.otp !== otp || Date.now() > record.expiry)
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  const seller = await Seller.findOne({ email }).select('+password');
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  seller.password = password;
  await seller.save();
  otpStore.delete(email);
  res.json({ success: true, message: 'Password reset successful' });
});
