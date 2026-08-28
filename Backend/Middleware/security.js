const hpp = require('hpp');
const helmet = require('helmet');
const { sanitize: mongoSanitize } = require('express-mongo-sanitize');

// Strip keys starting with `$` or containing `.` from arbitrary objects.
// In Express 5, req.query is read-only so we sanitize manually against the
// objects Mongoose actually reads from: req.body and req.params. Route
// handlers that read req.query should clone + sanitize before passing to
// DB queries (or use the helper `sanitizeReqQuery` below).
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    const value = obj[key];
    if (value && typeof value === 'object') {
      sanitizeObject(value);
    }
  }
  return obj;
};

// Returns a sanitized *copy* of req.query — never mutate it.
const sanitizeReqQuery = (req) => {
  if (!req.query || typeof req.query !== 'object') return {};
  return mongoSanitize(JSON.parse(JSON.stringify(req.query)));
};

const sanitizeBodyAndParams = (req, res, next) => {
  if (req.body && typeof req.body === 'object') sanitizeObject(req.body);
  if (req.params && typeof req.params === 'object') sanitizeObject(req.params);
  next();
};

const securityMiddleware = {
  hpp: hpp({
    whitelist: ['status', 'propertyType', 'bedrooms', 'bathrooms'],
  }),
  headers: helmet,
  sanitize: sanitizeBodyAndParams,
  sanitizeQuery: sanitizeReqQuery,
};

module.exports = securityMiddleware;
module.exports.sanitizeObject = sanitizeObject;
module.exports.sanitizeReqQuery = sanitizeReqQuery;
