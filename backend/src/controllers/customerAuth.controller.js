const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { sendTokens, generateRefreshToken, generateAccessToken } = require('../utils/jwt');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/email');

const otpStore = new Map(); // { email: { otp, expiry } }

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const exists = await Customer.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const referralCode = uuidv4().slice(0, 8).toUpperCase();
  const customer = await Customer.create({ name, email, password, phone, referralCode });
  sendTokens(res, customer, 'customer', 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const customer = await Customer.findOne({ email }).select('+password');
  if (!customer || !(await customer.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (!customer.isActive) return res.status(403).json({ message: 'Account suspended' });
  sendTokens(res, customer, 'customer');
});

exports.googleCallback = asyncHandler(async (req, res) => {
  sendTokens(res, req.user, 'customer');
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const customer = await Customer.findById(decoded.id);
  if (!customer) return res.status(401).json({ message: 'Invalid token' });
  const accessToken = generateAccessToken(customer._id, 'customer');
  res.json({ success: true, accessToken });
});

exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
};

exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const customer = await Customer.findByIdAndUpdate(
    req.user._id, { name, phone }, { new: true }
  );
  res.json({ success: true, user: customer });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const customer = await Customer.findOne({ email });
  if (!customer) return res.status(404).json({ message: 'Email not registered' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expiry: Date.now() + 10 * 60 * 1000 });
  console.log(`\n[OTP] Email: ${email} | OTP: ${otp}\n`);
  await sendEmail({
    to: email,
    subject: 'Password Reset OTP - BUYZONE',
    html: `<h2>Password Reset</h2><p>Your OTP is: <strong style="font-size:24px">${otp}</strong></p><p>Valid for 10 minutes.</p>`,
  });
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
  const customer = await Customer.findOne({ email }).select('+password');
  if (!customer) return res.status(404).json({ message: 'User not found' });
  customer.password = password;
  await customer.save();
  otpStore.delete(email);
  res.json({ success: true, message: 'Password reset successful' });
});
