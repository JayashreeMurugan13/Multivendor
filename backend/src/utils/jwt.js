const jwt = require('jsonwebtoken');

const generateAccessToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const generateRefreshToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });

const sendTokens = (res, user, role, statusCode = 200) => {
  const accessToken = generateAccessToken(user._id, role);
  const refreshToken = generateRefreshToken(user._id, role);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password, refreshToken: rt, ...userData } = user.toObject();
  res.status(statusCode).json({ success: true, accessToken, user: userData, role });
};

module.exports = { generateAccessToken, generateRefreshToken, sendTokens };
