const axios = require("axios");
const cheerio = require("cheerio");
const sc = require("../../config/source.config");
const retry = require("../../utils/retry");
const randomDelay = require("../../utils/randomDelay");
const BrowserPool = require("../../services/BrowserPool");
const selectors = require("../../config/selectors.config");
const { dedupeAndClean } = require("../../utils/imageValidator");
const { getBreakerRegistry } = require("./breakerRegistry");

/**
 * Error categories for telemetry / quarantine routing.
 *   NETWORK    -> retryable (5xx, ETIMEDOUT, ECONNRESET, ENOTFOUND, EAI_AGAIN)
 *   RATE_LIMIT -> retryable with longer delay (429, 503)
 *   HTTP_4XX   -> not retryable (404, 410, etc.) - the page is gone
 *   PARSER     -> not retryable, the HTML is unparseable
 *   CIRCUIT    -> breaker is open, treat as transient (skip this source)
 *   UNKNOWN    -> not retryable by default
 */
function categorizeError(err) {
  if (!err) return { category: "UNKNOWN", retryable: false };
  if (err.code === "CIRCUIT_OPEN") return { category: "CIRCUIT", retryable: false };
  if (err.code === "PARSER_ERROR") return { category: "PARSER", retryable: false };
  if (err.code === "VALIDATION_ERROR") return { category: "VALIDATION", retryable: false };

  const status = err.response && err.response.status;
  if (status === 429 || status === 503) {
    return { category: "RATE_LIMIT", retryable: true };
  }
  if (status >= 500 && status < 600) {
    return { category: "NETWORK", retryable: true };
  }
  if (status >= 400 && status < 500) {
    return { category: "HTTP_4XX", retryable: false };
  }

  const code = err.code || "";
  const retryableCodes = ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "EPIPE"];
  if (retryableCodes.includes(code)) {
    return { category: "NETWORK", retryable: true };
  }

  return { category: "UNKNOWN", retryable: false };
}

/** Normalize a URL into a stable dedupe key. */
function normalizeUrlKey(u) {
  try {
    const parsed = new URL(String(u));
    parsed.hash = "";
    let p = parsed.pathname.replace(/\/+$/, "");
    if (!p) p = "/";
    return (parsed.origin + p).toLowerCase();
  } catch (_) {
    return String(u || "").split("#")[0].replace(/\/$/, "").toLowerCase();
  }
}

class BaseScraper {
  constructor(sk, cfg) {
    this.sourceKey = sk;
    this.config = cfg;
    this.axiosInstance = axios.create({
      timeout: sc.axios.timeout,
      maxRedirects: sc.axios.maxRedirects,
      headers: (cfg && cfg.headers) || sc.defaults.headers,
    });
    this.selectors = selectors.sources[sk] || selectors.defaults;
    this.breaker = getBreakerRegistry().get(sk);
  }

  /**
   * Fetch a URL with the underlying axios instance. Wrapped by retry +
   * circuit breaker at the per-page level.
   */
  async fetchWithAxios(url) {
    return this.breaker.run(() =>
      retry(async () => {
        const r = await this.axiosInstance.get(url);
        return r.data;
      }, 3, 2000)
    );
  }

  async fetchWithPuppeteer(url) {
    let page = null;
    try {
      page = await BrowserPool.getPage({
        userAgent: this.config?.headers?.["User-Agent"],
        timeout: sc.puppeteer.timeout,
      });
      await page.goto(url, { waitUntil: sc.puppeteer.waitUntil, timeout: sc.puppeteer.timeout });
      const html = await page.content();
      return html;
    } finally {
      if (page) await BrowserPool.releasePage(page);
    }
  }

  async fetchHTML(url, fp) {
    if (fp || (this.config && this.config.usePuppeteer)) return this.fetchWithPuppeteer(url);
    try {
      return await this.fetchWithAxios(url);
    } catch (e) {
      const cat = categorizeError(e);
      if (cat.category === "HTTP_4XX") throw e;
      // Fall back to puppeteer for transient/JS-rendered pages
      return this.fetchWithPuppeteer(url);
    }
  }

  loadCheerio(html) {
    return cheerio.load(html);
  }

  async rateLimit() {
    const delay = (this.config && this.config.rateLimitMs) || sc.defaults.rateLimitMs;
    await new Promise((r) => setTimeout(r, delay));
  }

  async scrapeListingPage(p) {
    throw new Error("Must implement");
  }

  async scrapePropertyDetail(u) {
    throw new Error("Must implement");
  }

  // ---- pagination helpers (unchanged) ----
  findPagination($) {
    const pagination = this.selectors.pagination || {};
    const result = { hasNextPage: false, hasLoadMore: false, hasInfiniteScroll: false };
    if (pagination.nextPage) {
      const nextBtn = $(pagination.nextPage);
      result.hasNextPage = nextBtn.length > 0 && !nextBtn.hasClass("disabled");
    }
    if (pagination.loadMore) {
      result.hasLoadMore = $(pagination.loadMore).length > 0;
    }
    if (pagination.infiniteScroll) {
      result.hasInfiniteScroll = true;
    }
    return result;
  }

  hasNextPage($) {
    const pagination = this.findPagination($);
    return pagination.hasNextPage || pagination.hasLoadMore || pagination.hasInfiniteScroll;
  }

  findLoadMore($) {
    const pagination = this.selectors.pagination || {};
    if (pagination.loadMore) {
      const btn = $(pagination.loadMore);
      return btn.length > 0 ? pagination.loadMore : null;
    }
    return null;
  }

  findInfiniteScroll() {
    const pagination = this.selectors.pagination || {};
    return pagination.infiniteScroll || false;
  }

  /**
   * Normalize + filter image URLs in-place on a property dict.
   * Sets `propertyImages` (objects) and `hasImages` (bool).
   * Returns the list of normalized URLs.
   */
  finalizeImages(d, { maxImages } = {}) {
    const cleaned = dedupeAndClean(d.images || [], { maxImages });
    d.images = cleaned;
    d.hasImages = cleaned.length > 0;
    return cleaned;
  }

  /**
   * Scrape every available page and listing until the source is exhausted
   * or limits are reached. Stops after `maxConsecutiveEmptyPages` empty pages
   * or if the circuit breaker is open.
   */
  async scrape(o = {}) {
    const start = new Date();
    const mp = Number.isFinite(o.maxPages) && o.maxPages > 0 ? o.maxPages : Infinity;
    const ml = Number.isFinite(o.maxListings) && o.maxListings > 0 ? o.maxListings : Infinity;
    const maxConsecutiveEmptyPages = Number.isFinite(o.maxConsecutiveEmptyPages)
      ? o.maxConsecutiveEmptyPages
      : 3;
    const perPageRetries = Number.isFinite(o.perPageRetries) ? o.perPageRetries : 2;

    const all = [];
    const quarantined = [];
    const seenUrlKeys = new Set();
    const seenPropertyKeys = new Set();
    let pages = 0;
    let skipped = 0;
    let consecutiveEmptyPages = 0;
    const errors = [];

    for (let p = 1; p <= mp && all.length < ml; p++) {
      // Check breaker before attempting the page
      if (this.breaker.state === "OPEN") {
        const snap = this.breaker.snapshot();
        const remaining = sc.defaults.rateLimitMs * 0; // noop for clarity
        errors.push({
          category: "CIRCUIT",
          message: "Circuit breaker open for " + this.sourceKey,
          url: "page:" + p,
          timestamp: new Date(),
          breaker: snap,
        });
        break;
      }

      let urls = null;
      let pageError = null;
      for (let attempt = 0; attempt <= perPageRetries; attempt++) {
        try {
          await randomDelay(1000, 3000);
          urls = await this.scrapeListingPage(p);
          pageError = null;
          break;
        } catch (e) {
          pageError = e;
          const cat = categorizeError(e);
          if (!cat.retryable) break;
          if (attempt < perPageRetries) {
            await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
          }
        }
      }

      if (pageError) {
        errors.push({
          category: categorizeError(pageError).category,
          message: pageError.message,
          url: "page:" + p,
          timestamp: new Date(),
        });
        consecutiveEmptyPages += 1;
        if (consecutiveEmptyPages >= maxConsecutiveEmptyPages) break;
        continue;
      }

      pages += 1;

      if (!urls || urls.length === 0) {
        consecutiveEmptyPages += 1;
        if (consecutiveEmptyPages >= maxConsecutiveEmptyPages) {
          break;
        }
        continue;
      }
      consecutiveEmptyPages = 0;

      for (const u of urls) {
        if (all.length >= ml) break;
        const urlKey = "url:" + normalizeUrlKey(u);
        if (seenUrlKeys.has(urlKey)) continue;
        seenUrlKeys.add(urlKey);

        try {
          await this.rateLimit();
          const d = await this.scrapePropertyDetail(u);
          if (!d) {
            skipped += 1;
            continue;
          }
          // Final image sanitization
          this.finalizeImages(d);

          const propertyKey = d.propertyID || d.sourceID || d.sourceURL || urlKey;
          if (seenPropertyKeys.has("property:" + propertyKey)) continue;
          seenPropertyKeys.add("property:" + propertyKey);

          // Quarantine: properties with title but no images still count as data,
          // but flag so downstream can decide. We keep them with hasImages=false.
          all.push(d);
        } catch (e) {
          const cat = categorizeError(e);
          errors.push({
            category: cat.category,
            message: e.message,
            url: u,
            timestamp: new Date(),
          });
        }
      }

      if (all.length >= ml) break;
    }

    return {
      sourceKey: this.sourceKey,
      status: errors.length > 0 ? "partial" : "success",
      startedAt: start,
      completedAt: new Date(),
      durationMs: Date.now() - start.getTime(),
      pagesScraped: pages,
      listingsFound: all.length,
      listingsSkipped: skipped,
      listings: all,
      quarantined,
      errors,
      breaker: this.breaker.snapshot(),
      targetListings: Number.isFinite(ml) ? ml : null,
    };
  }
}

module.exports = BaseScraper;
module.exports.categorizeError = categorizeError;
module.exports.normalizeUrlKey = normalizeUrlKey;
