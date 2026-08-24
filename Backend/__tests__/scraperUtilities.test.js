const { createLimiter, createSourceSemaphore } = require('../property-aggregation/utils/concurrency');
const { createBreaker, createBreakerRegistry } = require('../property-aggregation/utils/circuitBreaker');
const {
  isPlaceholderUrl,
  isValidImageUrl,
  normalizeImageUrl,
  dedupeAndClean,
} = require('../property-aggregation/utils/imageValidator');
const BaseScraper = require('../property-aggregation/scrapers/base/BaseScraper');

describe('concurrency.createLimiter', () => {
  it('respects the concurrency cap', async () => {
    const limit = createLimiter(3);
    let active = 0;
    let peak = 0;
    const tasks = Array.from({ length: 12 }, () =>
      limit(async () => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, 20));
        active -= 1;
        return true;
      })
    );
    await Promise.all(tasks);
    expect(peak).toBeLessThanOrEqual(3);
    expect(peak).toBeGreaterThanOrEqual(2); // sanity: actually ran concurrently
  });

  it('propagates errors without blocking siblings', async () => {
    const limit = createLimiter(2);
    const ok = limit(async () => 'ok');
    const bad = limit(async () => { throw new Error('boom'); });
    const results = await Promise.allSettled([ok, bad]);
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
  });

  it('createSourceSemaphore caps per-key', async () => {
    const sem = createSourceSemaphore({ global: 4, perKey: 1 });
    let active = 0;
    let peak = 0;
    const tasks = Array.from({ length: 8 }, () =>
      sem.run('same-key', async () => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, 15));
        active -= 1;
      })
    );
    await Promise.all(tasks);
    expect(peak).toBeLessThanOrEqual(1);
  });
});

describe('circuitBreaker', () => {
  it('opens after failureThreshold and rejects with CIRCUIT_OPEN', async () => {
    const b = createBreaker({ failureThreshold: 2, cooldownMs: 60_000 });
    const failing = async () => { throw new Error('upstream down'); };
    await expect(b.run(failing)).rejects.toThrow('upstream down');
    await expect(b.run(failing)).rejects.toThrow('upstream down');
    await expect(b.run(failing)).rejects.toThrow(/Circuit breaker is OPEN/);
    expect(b.state).toBe('OPEN');
  });

  it('closes after success in HALF_OPEN', async () => {
    let n = 0;
    const b = createBreaker({ failureThreshold: 1, cooldownMs: 5, isFailure: () => true });
    await expect(b.run(async () => { throw new Error('x'); })).rejects.toThrow();
    expect(b.state).toBe('OPEN');
    await new Promise((r) => setTimeout(r, 10));
    await b.run(async () => { n += 1; });
    expect(b.state).toBe('CLOSED');
    expect(n).toBe(1);
  });

  it('non-failures do not count toward the breaker', async () => {
    const b = createBreaker({ failureThreshold: 2, cooldownMs: 60_000 });
    const parserErr = Object.assign(new Error('bad html'), { code: 'PARSER_ERROR' });
    await expect(b.run(async () => { throw parserErr; })).rejects.toThrow('bad html');
    await expect(b.run(async () => { throw parserErr; })).rejects.toThrow('bad html');
    expect(b.state).toBe('CLOSED');
  });

  it('registry gives isolated breakers per key', async () => {
    const reg = createBreakerRegistry({ failureThreshold: 1, cooldownMs: 60_000 });
    const fail = async () => { throw new Error('nope'); };
    await expect(reg.run('a', fail)).rejects.toThrow('nope');
    expect(reg.get('a').state).toBe('OPEN');
    expect(reg.get('b').state).toBe('CLOSED');
  });
});

describe('imageValidator', () => {
  it('rejects placeholder URLs', () => {
    expect(isPlaceholderUrl('https://via.placeholder.com/600x400')).toBe(true);
    expect(isPlaceholderUrl('https://example.com/pixel.gif')).toBe(true);
    expect(isPlaceholderUrl('https://example.com/no-image.png')).toBe(true);
    expect(isPlaceholderUrl('https://cdn.example.com/real.jpg')).toBe(false);
  });

  it('isValidImageUrl enforces http(s) and rejects data:', () => {
    expect(isValidImageUrl('https://cdn.example.com/x.jpg')).toBe(true);
    expect(isValidImageUrl('http://cdn.example.com/x.jpg')).toBe(true);
    expect(isValidImageUrl('data:image/png;base64,xxx')).toBe(false);
    expect(isValidImageUrl('ftp://example.com/x.jpg')).toBe(false);
    expect(isValidImageUrl('')).toBe(false);
    expect(isValidImageUrl('https://via.placeholder.com/600')).toBe(false);
  });

  it('normalizes protocol-relative URLs to https', () => {
    expect(normalizeImageUrl('//cdn.example.com/x.jpg')).toBe('https://cdn.example.com/x.jpg');
    expect(normalizeImageUrl('  https://cdn.example.com/x.jpg  ')).toBe('https://cdn.example.com/x.jpg');
  });

  it('dedupeAndClean keeps unique, valid, non-placeholder URLs', () => {
    const out = dedupeAndClean([
      'https://a.com/1.jpg',
      'https://a.com/1.jpg',
      'https://via.placeholder.com/600',
      'data:image/png;base64,xxx',
      '//b.com/2.jpg',
      'ftp://c.com/3.jpg',
      'https://d.com/4.jpg',
    ]);
    expect(out).toEqual([
      'https://a.com/1.jpg',
      'https://b.com/2.jpg',
      'https://d.com/4.jpg',
    ]);
  });

  it('dedupeAndClean respects maxImages', () => {
    const out = dedupeAndClean(
      Array.from({ length: 100 }, (_, i) => `https://a.com/${i}.jpg`),
      { maxImages: 5 }
    );
    expect(out).toHaveLength(5);
  });
});

describe('BaseScraper.categorizeError', () => {
  const { categorizeError } = BaseScraper;

  it('classifies 5xx as retryable NETWORK', () => {
    const e = { response: { status: 502 } };
    const c = categorizeError(e);
    expect(c.category).toBe('NETWORK');
    expect(c.retryable).toBe(true);
  });

  it('classifies 429 as RATE_LIMIT retryable', () => {
    const c = categorizeError({ response: { status: 429 } });
    expect(c.category).toBe('RATE_LIMIT');
    expect(c.retryable).toBe(true);
  });

  it('classifies 4xx as non-retryable HTTP_4XX', () => {
    const c = categorizeError({ response: { status: 404 } });
    expect(c.category).toBe('HTTP_4XX');
    expect(c.retryable).toBe(false);
  });

  it('classifies ETIMEDOUT as retryable', () => {
    const c = categorizeError({ code: 'ETIMEDOUT' });
    expect(c.category).toBe('NETWORK');
    expect(c.retryable).toBe(true);
  });

  it('classifies parser errors as non-retryable', () => {
    const e = Object.assign(new Error('bad html'), { code: 'PARSER_ERROR' });
    const c = categorizeError(e);
    expect(c.category).toBe('PARSER');
    expect(c.retryable).toBe(false);
  });
});

describe('BaseScraper.normalizeUrlKey', () => {
  const { normalizeUrlKey } = BaseScraper;

  it('strips hash and trailing slashes, lowercases host', () => {
    expect(normalizeUrlKey('https://Example.com/property/123/#contact'))
      .toBe('https://example.com/property/123');
  });

  it('falls back gracefully on non-URL strings', () => {
    expect(normalizeUrlKey('not a url')).toBe('not a url');
  });
});
