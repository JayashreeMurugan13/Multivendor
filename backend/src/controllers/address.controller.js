const asyncHandler = require('express-async-handler');
const Address = require('../models/Address');

exports.getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ customer: req.user._id });
  res.json({ success: true, addresses });
});

exports.addAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) await Address.updateMany({ customer: req.user._id }, { isDefault: false });
  const address = await Address.create({ ...req.body, customer: req.user._id });
  res.status(201).json({ success: true, address });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) await Address.updateMany({ customer: req.user._id }, { isDefault: false });
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, customer: req.user._id }, req.body, { new: true }
  );
  res.json({ success: true, address });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  await Address.findOneAndDelete({ _id: req.params.id, customer: req.user._id });
  res.json({ success: true });
});
