require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

const app = express();
const server = http.createServer(app);

connectDB();

const isVercel = process.env.VERCEL === '1';
if (!isVercel) {
  const { initSocket } = require('./socket/index');
  initSocket(server);
}

app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "https://images.unsplash.com", "https://res.cloudinary.com", "*"] } } }));
const allowedOrigins = [
  process.env.CLIENT_URL?.trim(),
  'https://frontend-lemon-beta-lbwk37v0df.vercel.app',
  'http://localhost:3000',
  'http://localhost:3002',
].filter(Boolean);
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', limiter);

// Routes
app.use('/api/auth/customer', require('./routes/customerAuth.routes'));
app.use('/api/auth/seller', require('./routes/sellerAuth.routes'));
app.use('/api/auth/admin', require('./routes/adminAuth.routes'));
app.use('/api/shop', require('./routes/shop.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/seller', require('./routes/seller.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/customer', require('./routes/customer.routes'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'BUYZONE API' }));

app.use(errorHandler);

if (!isVercel) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`BUYZONE server running on port ${PORT}`));
}

module.exports = app;
