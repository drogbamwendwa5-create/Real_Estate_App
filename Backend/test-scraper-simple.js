const axios = require('axios');
const cheerio = require('cheerio');
const PropertyNormalizer = require('./property-aggregation/utils/PropertyNormalizer');
const sc = require('./property-aggregation/config/source.config');

class SimpleBuyRentScraper {
  constructor() {
    this.config = sc.sources.buyrent;
  }

  async scrapeListingPage(p) {
    const u = p === 1 ? this.config.baseUrl : this.config.baseUrl + '?page=' + p;
    console.log(`[Scraper] Fetching page ${p}: ${u}`);
    const h = await axios.get(u, { timeout: 15000 });
    const $ = cheerio.load(h.data);
    const urls = [];
    $(".property-card a, .listing-card a, a[href*='/listings/']").each((_, e) => {
      const h2 = $(e).attr("href");
      if (h2 && h2.includes("/listings/") && !urls.includes(h2) && !h2.includes("crm/account/listings/create")) {
        urls.push(h2.startsWith("http") ? h2 : this.config.baseUrl + h2);
      }
    });
    return urls;
  }

  async scrapePropertyDetail(u) {
    console.log(`[Scraper] Fetching detail: ${u}`);
    const h = await axios.get(u, { timeout: 15000 });
    const $ = cheerio.load(h.data);
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

  async scrape(o = {}) {
    const start = new Date();
    const maxRuntime = o.maxRuntime || 30000;
    const all = [];
    const seen = new Set();
    let pages = 0;

    for (let p = 1; p <= 2; p++) {
      const elapsed = Date.now() - start.getTime();
      if (elapsed >= maxRuntime) {
        console.log(`[Scraper] Runtime limit reached. Stopping after page ${p}.`);
        break;
      }

      try {
        const urls = await this.scrapeListingPage(p);
        pages++;
        if (!urls || urls.length === 0) break;

        for (const u of urls) {
          const elapsed2 = Date.now() - start.getTime();
          if (elapsed2 >= maxRuntime) {
            console.log(`[Scraper] Runtime limit reached during detail scraping.`);
            break;
          }

          try {
            if (seen.has(u)) {
              console.log(`[Scraper] Skipping duplicate: ${u}`);
              continue;
            }
            seen.add(u);

            const d = await this.scrapePropertyDetail(u);
            if (d) {
              all.push(d);
            }
          } catch (e) {
            console.warn(`[Scraper] Error scraping ${u}:`, e.message);
          }
        }
      } catch (e) {
        console.warn(`[Scraper] Error scraping page ${p}:`, e.message);
        break;
      }
    }

    return {
      sourceKey: 'buyrent',
      status: 'success',
      startedAt: start,
      completedAt: new Date(),
      durationMs: Date.now() - start.getTime(),
      pagesScraped: pages,
      listingsFound: all.length,
      listings: all,
    };
  }
}

(async () => {
  try {
    const scraper = new SimpleBuyRentScraper();
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
