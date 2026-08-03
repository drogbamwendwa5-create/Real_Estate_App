const BaseScraper = require("../base/BaseScraper");
const P = require("./parser");
const E = require("./extractor");
const V = require("./validator");
const sc = require("../../config/source.config");

class BuyRentScraper extends BaseScraper {
  constructor() {
    super("buyrent", sc.sources.buyrent);
    this.p = new P();
    this.e = new E();
    this.v = new V();
  }

  async scrapeListingPage(p) {
    const u = p === 1 ? this.config.baseUrl : this.config.baseUrl + '?page=' + p;
    console.log(`[BuyRentScraper] Fetching page ${p}: ${u}`);
    const h = await this.fetchHTML(u);
    const $ = this.loadCheerio(h);
    const urls = [];

    // Look for property listing links on the page
    $(".property-card a, .listing-card a, a[href*='/listings/']").each((_, e) => {
      const h2 = $(e).attr("href");
      if (h2 && h2.includes("/listings/") && !urls.includes(h2) && !h2.includes("crm/account/listings/create")) {
        urls.push(h2.startsWith("http") ? h2 : this.config.baseUrl + h2);
      }
    });

    // If no property cards found, try alternative selectors
    if (urls.length === 0) {
      console.log('[BuyRentScraper] No property cards found, trying alternative selectors...');
      const allLinks = [];
      $('a[href]').each((_, e) => {
        const href = $(e).attr("href");
        if (href && href.includes("/listings/") && href.length > 30 && href.length < 200 && !href.includes("crm/account/listings/create")) {
          const cleanHref = href.startsWith("http") ? href : this.config.baseUrl + href;
          if (!allLinks.includes(cleanHref)) {
            allLinks.push(cleanHref);
          }
        }
      });
      allLinks.forEach(link => urls.push(link));
    }

    return urls;
  }

  async scrapePropertyDetail(u) {
    const h = await this.fetchHTML(u);
    const $ = this.loadCheerio(h);
    const raw = this.e.extract($, u, this.config.baseUrl);
    const property = this.p.parse(raw);
    const v = this.v.validate(property);
    if (v.isValid) return v.data;
    return null;
  }
}

module.exports = BuyRentScraper;