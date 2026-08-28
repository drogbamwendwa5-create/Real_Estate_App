const morgan = require('morgan');

const logger = () => {
  // ":req[X-Request-Id] if defined" prints the request id when present and
  // falls back to " - " when not — no extra dependency needed.
  morgan.token('rid', req => (req.id ? req.id : '-'));
  const format = ':rid :method :url :status :res[content-length] - :response-time ms';
  if (process.env.NODE_ENV === 'development') {
    return morgan(format);
  }
  return morgan(format);
};

module.exports = logger;