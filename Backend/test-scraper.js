const BaseScraper = require('./property-aggregation/scrapers/base/BaseScraper');
const PropertyNormalizer = require('./property-aggregation/utils/PropertyNormalizer');
const sc = require('./property-aggregation/config/source.config');

class BuyRentTestScraper extends BaseScraper {
  constructor() {
    super('buyrent', sc.sources.buyrent);
  }

  async scrapeListingPage(p) {
    const u = p === 1 ? this.config.baseUrl + '/listings' : this.config.baseUrl + '/listings?page=' + p;
    console.log(`[TestScraper] Fetching page ${p}: ${u}`);
    const h = await this.fetchHTML(u);
    const $ = this.loadCheerio(h);
    const urls = [];
    $(".property-card a, .listing-card a, a[href*='/listings/']").each((_, e) => {
      const h2 = $(e).attr("href");
      if (h2 && h2.includes("/listings/") && !urls.includes(h2)) {
        urls.push(h2.startsWith("http") ? h2 : this.config.baseUrl + h2);
      }
    });
    return urls;
  }

  async scrapePropertyDetail(u) {
    console.log(`[TestScraper] Fetching detail: ${u}`);
    const h = await this.fetchHTML(u);
    const $ = this.loadCheerio(h);
    const title = $('h1').first().text().trim();
    const priceText = $('body').text().match(/KSh[^\n]{0,20}|KES[^\n]{0,20}|\b\d{1,3}(,\d{3})+(\.\d+)?\b/);
    return PropertyNormalizer.normalize({
      title,
      price: priceText ? priceText[0] : '0',
      listingType: 'for-sale',
      sourceURL: u,
      sourceID: u.split('/').pop() || '',
    }, 'buyrent');
  }
}

(async () => {
  try {
    const scraper = new BuyRentTestScraper();
    console.log('Starting scraper (max 30 seconds)...');
    const result = await scraper.scrape({ maxRuntime: 30000 });
    console.log('\n=== Results ===');
    console.log(`Status: ${result.status}`);
    console.log(`Listings found: ${result.listingsFound}`);
    console.log(`Pages scraped: ${result.pagesScraped}`);
    console.log(`Duration: ${result.durationMs}ms`);
    console.log('\nListings:');
    result.listings.forEach((listing, i) => {
      console.log(`  ${i + 1}. ${listing.title} (${listing.price})`);
    });
  } catch (err) {
    console.error('\n=== Error ===');
    console.error(err.message);
    console.error(err.stack);
  }
})();
