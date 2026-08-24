const BaseScraper = require("../base/BaseScraper");
const P = require("./parser");
const E = require("./extractor");
const V = require("./validator");
const sc = require("../../config/source.config");

/**
 * Jiji Kenya scraper.
 *
 * Notes:
 *   - Jiji is an SPA, so puppeteer is used (configured in source.config).
 *   - Listing pages use querystring pagination (?page=N) on
 *     /apartments-houses-for-sale and /houses-apartments-for-rent.
 *   - Listing cards render as <a class="b-list-advert__item" href="/property-...">
 *     or <a data-testid="advert-link" href="/...">.
 *   - We dedupe within the run via BaseScraper URL-key normalization.
 */
class JijiScraper extends BaseScraper {
  constructor() {
    super("jiji", sc.sources.jiji);
    this.p = new P();
    this.e = new E();
    this.v = new V();
  }

  _listingPaths() {
    return [
      "/apartments-houses-for-sale",
      "/houses-apartments-for-rent",
      "/land-for-sale",
      "/commercial-properties-for-sale",
      "/commercial-properties-for-rent",
    ];
  }

  _buildListingUrl(path, page) {
    const sep = path.includes("?") ? "&" : "?";
    if (page <= 1) return this.config.baseUrl + path;
    return this.config.baseUrl + path + sep + "page=" + page;
  }

  async scrapeListingPage(page) {
    const urls = new Set();
    for (const path of this._listingPaths()) {
      const url = this._buildListingUrl(path, page);
      try {
        const html = await this.fetchHTML(url);
        const $ = this.loadCheerio(html);

        $(
          'a[href*="/property-"], a[href*="/apartment-"], a[href*="/house-"], a[href*="/land-"], a[data-testid="advert-link"]'
        ).each((_, e) => {
          let href = $(e).attr("href");
          if (!href) return;
          // Skip category/nav links
          if (/^\/(?:property|house|apartment|land|commercial-properties)-?for-(?:sale|rent)\/?$/i.test(href)) return;
          if (href.startsWith("/")) href = this.config.baseUrl + href;
          if (!urls.has(href)) urls.add(href);
        });
      } catch (_) {
        // single listing-page failure: keep going on the rest
      }
    }
    return Array.from(urls);
  }

  async scrapePropertyDetail(u) {
    const html = await this.fetchHTML(u);
    const $ = this.loadCheerio(html);
    const raw = this.e.extract($, u, this.config.baseUrl);
    const d = this.p.parse(raw);
    const v = this.v.validate(d);
    if (v.isValid) return v.data;
    const onlyImageMissing = v.errors.length === 1 && v.errors[0] === "Missing images";
    if (onlyImageMissing) {
      d.hasImages = false;
      return d;
    }
    return null;
  }
}

module.exports = JijiScraper;
