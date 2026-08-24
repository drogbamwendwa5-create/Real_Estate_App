const BaseScraper = require("../base/BaseScraper");
const P = require("./parser");
const E = require("./extractor");
const V = require("./validator");
const sc = require("../../config/source.config");

/**
 * PigiaMe Kenya scraper.
 *
 * Listing pages live under /property-for-sale and /property-to-rent, paginated
 * with ?page=N.
 */
class PigiaMeScraper extends BaseScraper {
  constructor() {
    super("pigiame", sc.sources.pigiame);
    this.p = new P();
    this.e = new E();
    this.v = new V();
  }

  _listingPaths() {
    return [
      { path: "/property-for-sale", type: "for-sale" },
      { path: "/property-to-rent", type: "for-rent" },
    ];
  }

  _buildListingUrl(path, page) {
    if (page <= 1) return this.config.baseUrl + path;
    const sep = path.includes("?") ? "&" : "?";
    return this.config.baseUrl + path + sep + "page=" + page;
  }

  async scrapeListingPage(page) {
    const urls = new Set();
    for (const { path, type } of this._listingPaths()) {
      const url = this._buildListingUrl(path, page);
      try {
        const html = await this.fetchHTML(url);
        const $ = this.loadCheerio(html);

        $(
          'a[href*="/property-"], a[href*="/real-estate-"], a[href*="/house-"], a.listing-title, a.ad-title'
        ).each((_, e) => {
          let href = $(e).attr("href");
          if (!href) return;
          if (/^\/(?:property|real-estate|house|land)-for-(?:sale|rent)\/?$/i.test(href)) return;
          if (href.startsWith("/")) href = this.config.baseUrl + href;
          if (!urls.has(href)) urls.add(href);
        });
      } catch (_) {
        // continue with the next listing path
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

module.exports = PigiaMeScraper;
