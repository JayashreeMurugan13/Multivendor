const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');
const Admin = require('../models/Admin');

const models = { customer: Customer, seller: Seller, admin: Admin };

const protect = (role) => async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== role) return res.status(403).json({ message: 'Forbidden' });

    const Model = models[role];
    req.user = await Model.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });

    if (role === 'seller' && req.user.status !== 'approved') {
      return res.status(403).json({ message: 'Seller account not approved' });
    }

    req.role = role;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = {
  protectCustomer: protect('customer'),
  protectSeller: protect('seller'),
  protectAdmin: protect('admin'),
};
