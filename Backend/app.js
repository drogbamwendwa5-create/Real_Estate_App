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
const { maintenanceMode, attachFeatureFlags } = require('./Middleware/featureFlags');

// Initialize Express app
const app = express();

// Parse nested query-string objects (e.g. price[gte]=100000 -> { price: { gte: ... } }).
// Express 5 defaults to the "simple" parser which flattens bracket notation and
// breaks the APIFeatures range filters used across controllers.
app.set('query parser', 'extended');

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
const superAdminRoutes = require('./Routes/superAdminRoutes');
const uploadRoutes = require('./Routes/uploadRoutes');
// Property aggregation routes
const propertyAggregationRoutes = require('./property-aggregation/api/propertyAggregationRoutes');
// Map / geospatial routes (OpenStreetMap)
const mapRoutes = require('./Routes/MapRoutes');
const verificationRoutes = require('./Routes/verificationRoutes');
const reportRoutes = require('./Routes/reportRoutes');
const roleRoutes = require('./Routes/roleRoutes');
const activityRoutes = require('./Routes/activityRoutes');
const { seedRbac } = require('./Services/rbacService');

// Connect to database
connectDB();

// Configure Cloudinary
configureCloudinary();

// Seed default categories
const seedCategories = require('./seed/categorySeed');
seedCategories();
seedRbac().catch(error => console.warn('[RBAC] Seed skipped:', error.message));
// Seed sample properties (upserts)
const seedProperties = require('./seed/propertySeed');
seedProperties();
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

// Feature flags middleware (attach flags to all requests, enforce maintenance mode)
app.use(attachFeatureFlags);
app.use(maintenanceMode);

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
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/upload', uploadRoutes);
// Mount property aggregation routes (independent module)
app.use('/api/property-aggregation', propertyAggregationRoutes);
// Mount map / geospatial routes (OpenStreetMap)
app.use('/api/maps', mapRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/profiles', userRoutes);

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

// Property aggregation scheduler
if (process.env.ENABLE_PROPERTY_AGGREGATION === "true") {
  try {
    const propertyScheduler = require("./property-aggregation/jobs");
    app.locals.propertyScheduler = propertyScheduler;
    app.locals.startPropertyScheduler = () => propertyScheduler.start();
    console.log("[App] Property aggregation module loaded");
  } catch (e) {
    console.warn("[App] Property aggregation module failed to load:", e.message);
  }
}

module.exports = app;
