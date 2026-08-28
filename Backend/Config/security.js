const helmet = require('helmet');

// Allow Cloudinary (image hosting) and any explicit frontend origin configured via env.
const cloudinaryHost = process.env.CLOUDINARY_CLOUD_NAME
  ? `https://res.cloudinary.com`
  : null;
const apiOrigin = (process.env.API_SELF_ORIGIN || '').trim() || null;

const defaultSrc = ["'self'"];
const connectSrc = ["'self'"].filter(Boolean).concat(
  cloudinaryHost ? [cloudinaryHost] : [],
  apiOrigin ? [apiOrigin] : []
);
const imgSrc = ["'self'", "data:"].concat(cloudinaryHost ? [cloudinaryHost] : []);

const securityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc,
        scriptSrc: ["'self'"],
        // 'unsafe-inline' is required by several React Native Web / Expo runtime
        // styles. Keep it but drop the wildcard img/connect sources.
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc,
        connectSrc,
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
    // 1 year HSTS, only enable over HTTPS — Render serves HTTPS so this is safe in prod.
    hsts: process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true, preload: false }
      : false,
    hidePoweredBy: true,
    noSniff: true,
    xssFilter: true,
  });
};

module.exports = securityHeaders;