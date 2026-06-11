const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendTokens, generateAccessToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');

const otpStore = new Map();

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (!admin.isActive) return res.status(403).json({ message: 'Account disabled' });
  sendTokens(res, admin, 'admin');
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const admin = await Admin.findById(decoded.id);
  if (!admin) return res.status(401).json({ message: 'Invalid token' });
  const accessToken = generateAccessToken(admin._id, 'admin');
  res.json({ success: true, accessToken });
});

exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true });
};

exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: req.user });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(404).json({ message: 'Email not registered' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expiry: Date.now() + 10 * 60 * 1000 });
  await sendEmail({ to: email, subject: 'Admin Password Reset OTP - BUYZONE', html: `<h2>Password Reset</h2><p>OTP: <strong style="font-size:24px">${otp}</strong></p><p>Valid for 10 minutes.</p>` });
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
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  admin.password = password;
  await admin.save();
  otpStore.delete(email);
  res.json({ success: true, message: 'Password reset successful' });
});
