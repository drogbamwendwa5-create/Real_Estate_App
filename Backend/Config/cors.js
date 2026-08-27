const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:19000',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://192.168.0.29:8081',
  'http://192.168.0.29:19006',
  'https://real-estate-app-jvgi.onrender.com',
];

// Allow any localhost, local network IP, or render/vercel hosting for apps
const devPattern = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|.*\.onrender\.com|.*\.vercel\.app|.*\.netlify\.app|.*\.exp\.direct)(:\d+)?$/;

// Also allow any origin set via environment variable
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(',').forEach(o => allowedOrigins.push(o.trim()));
}
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.trim());
}

module.exports = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || devPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-super-admin-break-glass-pin'],
  maxAge: 86400,
};
