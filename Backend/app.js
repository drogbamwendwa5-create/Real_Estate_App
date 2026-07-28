const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Config imports
const corsOptions = require('./Config/cors');
const connectDB = require('./Config/database');
const { configureCloudinary } = require('./Config/cloudinary');
const securityHeaders = require('./Config/security');

// Middleware imports
const securityMiddleware = require('./Middleware/security');
const { generalLimiter } = require('./Middleware/rateLimiter');
const logger = require('./Middleware/logger');
const errorHandler = require('./Middleware/errorHandler');

// Route imports
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/userRoutes');
const propertyRoutes = require('./Routes/propertyRoutes');
const categoryRoutes = require('./Routes/categoryRoutes');
const reviewRoutes = require('./Routes/reviewRoutes');
const favouriteRoutes = require('./Routes/favouriteRoutes');
const messageRoutes = require('./Routes/messageRoutes');
const notificationRoutes = require('./Routes/notificationRoutes');
const subscriptionRoutes = require('./Routes/subscriptionRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const uploadRoutes = require('./Routes/uploadRoutes');

const app = express();

// Connect to database
connectDB();

// Configure Cloudinary
configureCloudinary();

// Security middleware
// Note: xss-clean and express-mongo-sanitize are incompatible with Express 5
// (req.query is read-only) and hang/crash requests. Mongoose sanitizeFilter
// covers NoSQL injection; validators cover input shape.
app.use(securityHeaders());
app.use(cors(corsOptions));
app.use(securityMiddleware.hpp);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger
app.use(logger());

// Rate limiter
app.use(generalLimiter);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Default route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Real Estate API is running',
    version: '1.0.0',
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
