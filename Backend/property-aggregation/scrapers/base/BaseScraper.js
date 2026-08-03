const axios = require("axios");
const cheerio = require("cheerio");
const sc = require("../../config/source.config");
const retry = require("../../utils/retry");
const randomDelay = require("../../utils/randomDelay");
const BrowserPool = require("../../services/BrowserPool");
const selectors = require("../../config/selectors.config");

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
  }

  async fetchWithAxios(url) {
    return await retry(async () => {
      const r = await this.axiosInstance.get(url);
      return r.data;
    }, 3, 2000);
  }

  async fetchWithPuppeteer(url) {
    let page = null;
    try {
      page = await BrowserPool.getPage({
        userAgent: this.config?.headers?.["User-Agent"],
        timeout: sc.puppeteer.timeout
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

  /**
   * Detect pagination: check if there's a next page, load more button, or infinite scroll
   * @param {CheerioStatic} $ - Cheerio instance
   * @returns {Object} Pagination detection result
   */
  findPagination($) {
    const pagination = this.selectors.pagination || {};
    const result = { hasNextPage: false, hasLoadMore: false, hasInfiniteScroll: false };

    // Check for next page link
    if (pagination.nextPage) {
      const nextBtn = $(pagination.nextPage);
      result.hasNextPage = nextBtn.length > 0 && !nextBtn.hasClass('disabled');
    }

    // Check for load more button
    if (pagination.loadMore) {
      result.hasLoadMore = $(pagination.loadMore).length > 0;
    }

    // Check for infinite scroll
    if (pagination.infiniteScroll) {
      result.hasInfiniteScroll = true;
    }

    return result;
  }

  /**
   * Check if a next page exists
   * @param {CheerioStatic} $ - Cheerio instance
   * @returns {boolean}
   */
  hasNextPage($) {
    const pagination = this.findPagination($);
    return pagination.hasNextPage || pagination.hasLoadMore || pagination.hasInfiniteScroll;
  }

  /**
   * Find load more button
   * @param {CheerioStatic} $ - Cheerio instance
   * @returns {string|null} Selector for load more button
   */
  findLoadMore($) {
    const pagination = this.selectors.pagination || {};
    if (pagination.loadMore) {
      const btn = $(pagination.loadMore);
      return btn.length > 0 ? pagination.loadMore : null;
    }
    return null;
  }

  /**
   * Check if page uses infinite scroll
   * @returns {boolean}
   */
  findInfiniteScroll() {
    const pagination = this.selectors.pagination || {};
    return pagination.infiniteScroll || false;
  }

  /**
   * Scrape every available page and listing until the source is exhausted.
   * Stops after three consecutive empty pages.
   */
  async scrape(o = {}) {
    const start = new Date();
    const mp = Number.isFinite(o.maxPages) && o.maxPages > 0 ? o.maxPages : Infinity;
    const ml = Number.isFinite(o.maxListings) && o.maxListings > 0 ? o.maxListings : Infinity;
    const all = [];
    const seenKeys = new Set();
    let pages = 0;
    let errors = [];
    let consecutiveEmptyPages = 0;

    for (let p = 1; p <= mp && all.length < ml; p++) {
      try {
        await randomDelay(1000, 3000);
        const urls = await this.scrapeListingPage(p);
        pages++;

        if (!urls || urls.length === 0) {
          consecutiveEmptyPages++;
          if (consecutiveEmptyPages >= 3) {
            console.log(`[${this.sourceKey}] No listings found for ${consecutiveEmptyPages} consecutive pages. Stopping.`);
            break;
          }
          continue;
        }
        consecutiveEmptyPages = 0;

        for (const u of urls) {
          if (all.length >= ml) break;
          try {
            const normalizedUrl = String(u).split("#")[0].replace(/\/$/,"").toLowerCase();
            if (seenKeys.has("url:"+normalizedUrl)) continue;
            seenKeys.add("url:"+normalizedUrl);
            await this.rateLimit();
            const d = await this.scrapePropertyDetail(u);
            if (d) {
              const propertyKey = d.propertyID || d.sourceID || d.sourceURL || u;
              if (seenKeys.has("property:"+propertyKey)) continue;
              seenKeys.add("property:"+propertyKey);
              if (!d.images || d.images.length === 0) {
                if (!d.propertyImages || d.propertyImages.length === 0) {
                  d.images = ['https://via.placeholder.com/600x400?text=No+Image+Available'];
                }
              }
              all.push(d);
            }
          } catch (e) {
            errors.push({ message: e.message, url: u, timestamp: new Date() });
          }
        }

        if (all.length >= ml) break;

      } catch (e) {
        errors.push({ message: e.message, url: "page:" + p, timestamp: new Date() });
      }
    }

    return {
      sourceKey: this.sourceKey,
      status: errors.length > 0 ? "partial" : "success",
      startedAt: start,
      completedAt: new Date(),
      durationMs: Date.now() - start.getTime(),
      pagesScraped: pages,
      listingsFound: all.length,
      listings: all,
      errors,
      targetListings: Number.isFinite(ml) ? ml : null,
    };
  }
}

module.exports = BaseScraper;
