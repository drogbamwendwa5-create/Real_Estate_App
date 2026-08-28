// Single source of truth for auth cookies. We send the JWT in the JSON body
// for mobile clients, but also drop a hardened cookie so web clients can rely
// on httpOnly + sameSite=strict and never need to read it from JS.
const isProd = () => process.env.NODE_ENV === 'production';

const baseOptions = () => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: 'strict',
  path: '/api',
});

const ACCESS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;     // matches JWT_EXPIRE
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;   // matches refresh expiry

const setAuthCookies = (res, accessToken, refreshToken) => {
  if (accessToken) {
    res.cookie('token', accessToken, {
      ...baseOptions(),
      maxAge: ACCESS_MAX_AGE_MS,
    });
  }
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...baseOptions(),
      maxAge: REFRESH_MAX_AGE_MS,
    });
  }
};

const clearAuthCookies = (res) => {
  res.clearCookie('token', baseOptions());
  res.clearCookie('refreshToken', baseOptions());
};

module.exports = { setAuthCookies, clearAuthCookies, baseOptions };
