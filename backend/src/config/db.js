const mongoose = require('mongoose');

let cached = global._mongoConn;

const connectDB = async () => {
  if (cached && mongoose.connection.readyState === 1) return;
  cached = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 30000,
  });
  global._mongoConn = cached;
  console.log(`MongoDB Connected: ${mongoose.connection.host}`);
};

module.exports = connectDB;
