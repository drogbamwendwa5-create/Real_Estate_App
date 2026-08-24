const BaseScraper = require("../base/BaseScraper");
const P = require("./parser");
const E = require("./extractor");
const V = require("./validator");
const sc = require("../../config/source.config");

class KenyaPropertyCentreScraper extends BaseScraper {
  constructor() {
    super("kenyapropertycentre", sc.sources.kenyapropertycentre);
    this.p = new P();
    this.e = new E();
    this.v = new V();
  }

  async scrapeListingPage(p) {
    const s = this.config.baseUrl + "/properties-for-sale?Page=" + p;
    const r = this.config.baseUrl + "/properties-to-let?Page=" + p;
    const urls = [];
    for (const x of [s, r]) {
      try {
        const h = await this.fetchHTML(x);
        const $ = this.loadCheerio(h);
        $(".property-listing a, .listing-card a, a[href*='/property/']").each((_, e) => {
          const h2 = $(e).attr("href");
          if (h2 && h2.includes("/property/") && !urls.includes(h2)) {
            urls.push(h2.startsWith("http") ? h2 : this.config.baseUrl + h2);
          }
        });
      } catch (_) {
        // skip this listing-page URL, keep scraping the rest
      }
    }
    return urls;
  }

  async scrapePropertyDetail(u) {
    const h = await this.fetchHTML(u);
    const $ = this.loadCheerio(h);
    const d = this.e.extract($, u, this.config.baseUrl);
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

module.exports = KenyaPropertyCentreScraper;
