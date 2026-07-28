const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:19000',
  'http://localhost:8080',
  'http://192.168.0.29:8081',
  'http://192.168.0.29:19006',
];

// Also allow any localhost origin for development
const devPattern = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/;

// Also allow any origin set via environment variable
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

module.exports = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || devPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
};
