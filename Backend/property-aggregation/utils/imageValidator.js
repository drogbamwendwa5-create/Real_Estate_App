/**
 * Image URL helpers.
 *
 * Strict image validation:
 *  - Accept only absolute http(s) URLs
 *  - Reject known placeholder/trackers (via.placeholder, pixel.gif, etc.)
 *  - Reject data: URLs
 *  - Normalize protocol-relative URLs to https
 *
 * Optional head-check via `verifyImageReachable` (off by default; will
 * issue an HTTP HEAD against the image URL).
 */
const PLACEHOLDER_PATTERNS = [
  /via\.placeholder\.com/i,
  /placehold\.it/i,
  /placeholder\.(com|net|org)/i,
  /pixel\.gif/i,
  /transparent\.gif/i,
  /spacer\.gif/i,
  /1x1\.(gif|png)/i,
  /loading\.gif/i,
  /no[-_]?image/i,
  /noimage/i,
  /not[-_]?available/i,
];

function isPlaceholderUrl(u) {
  if (!u) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(String(u)));
}

function isValidImageUrl(u) {
  if (!u || typeof u !== 'string') return false;
  const trimmed = u.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:')) return false;
  if (trimmed.startsWith('//')) {
    return /^https?:\/\//i.test('https:' + trimmed);
  }
  if (!/^https?:\/\//i.test(trimmed)) return false;
  if (isPlaceholderUrl(trimmed)) return false;
  return true;
}

function normalizeImageUrl(u) {
  if (!u) return '';
  let url = String(u).trim();
  if (url.startsWith('//')) url = 'https:' + url;
  return url;
}

function dedupeAndClean(images, { maxImages = 50 } = {}) {
  if (!Array.isArray(images)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of images) {
    const norm = normalizeImageUrl(raw);
    if (!isValidImageUrl(norm)) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
    if (out.length >= maxImages) break;
  }
  return out;
}

/**
 * Verify an image URL responds with a 2xx/3xx status. Skips non-image URLs.
 * Uses HEAD first, falls back to GET on 405.
 * @param {string} url
 * @param {{ timeoutMs?: number, maxRedirects?: number }} opts
 * @returns {Promise<boolean>}
 */
async function verifyImageReachable(url, opts = {}) {
  if (!isValidImageUrl(url)) return false;
  const axios = require('axios');
  const timeoutMs = opts.timeoutMs ?? 8000;
  const maxRedirects = opts.maxRedirects ?? 3;
  const config = {
    url,
    timeout: timeoutMs,
    maxRedirects,
    validateStatus: (s) => s >= 200 && s < 400,
    responseType: 'stream',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ImageVerifier/1.0)',
      Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5',
    },
  };
  try {
    const r = await axios.request(config);
    if (r && r.status >= 200 && r.status < 400) return true;
    return false;
  } catch (e) {
    // Some servers reject HEAD; try GET (range) once
    if (e && e.response && e.response.status === 405) {
      try {
        const r2 = await axios.request({
          ...config,
          method: 'get',
          headers: { ...config.headers, Range: 'bytes=0-1023' },
        });
        return !!(r2 && r2.status >= 200 && r2.status < 400);
      } catch (_) {
        return false;
      }
    }
    return false;
  }
}

module.exports = {
  isPlaceholderUrl,
  isValidImageUrl,
  normalizeImageUrl,
  dedupeAndClean,
  verifyImageReachable,
};
