const BaseScraper = require("../base/BaseScraper");
const P = require("./parser");
const E = require("./extractor");
const V = require("./validator");
const sc = require("../../config/source.config");

class Property24Scraper extends BaseScraper {
  constructor() {
    super("property24", sc.sources.property24);
    this.p = new P();
    this.e = new E();
    this.v = new V();
  }

  async scrapeListingPage(p) {
    const urls = [];
    const listingUrls = [
      this.config.baseUrl + "/to-rent?Page=" + p,
      this.config.baseUrl + "/for-sale?Page=" + p,
    ];
    for (const u of listingUrls) {
      try {
        const h = await this.fetchHTML(u);
        const $ = this.loadCheerio(h);
        $(".propertyListing a, a[href*='/property/']").each((_, e) => {
          const h2 = $(e).attr("href");
          if (h2 && h2.includes("/property/") && !urls.includes(h2)) {
            urls.push(h2.startsWith("http") ? h2 : this.config.baseUrl + h2);
          }
        });
      } catch (e) {
        // individual listing-page failure: don't kill the whole source
        this._lastListingErrors = this._lastListingErrors || [];
        this._lastListingErrors.push({ url: u, error: e.message });
      }
    }
    return urls;
  }

  async scrapePropertyDetail(u) {
    const h = await this.fetchHTML(u);
    const $ = this.loadCheerio(h);
    const raw = this.e.extract($, u, this.config.baseUrl);
    const d = this.p.parse(raw);
    const v = this.v.validate(d);
    if (v.isValid) return v.data;
    // Keep property with no images; still allow other valid fields through.
    const onlyImageMissing = v.errors.length === 1 && v.errors[0] === "Missing images";
    if (onlyImageMissing) {
      d.hasImages = false;
      return d;
    }
    return null;
  }
}

module.exports = Property24Scraper;
