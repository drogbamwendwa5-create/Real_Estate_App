const hpp = require('hpp');
const helmet = require('helmet');

// xss-clean / express-mongo-sanitize mutate req.query, which is read-only in Express 5
const securityMiddleware = {
  hpp: hpp({
    whitelist: ['status', 'propertyType', 'bedrooms', 'bathrooms'],
  }),
  headers: helmet,
};

module.exports = securityMiddleware;