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
const { initSocket } = require('./socket/index');
const errorHandler = require('./middleware/error');

const app = express();
const server = http.createServer(app);

connectDB();
initSocket(server);

app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "https://images.unsplash.com", "https://res.cloudinary.com", "*"] } } }));
app.use(cors({ origin: [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3002'], credentials: true }));
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`BUYZONE server running on port ${PORT}`));
