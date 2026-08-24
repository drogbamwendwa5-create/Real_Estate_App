const sc = require("../config/source.config");
const PropertyImportService = require("./PropertyImportService");
const ScraperLogger = require("../logger/ScraperLogger");
const CacheManager = require("./CacheManager");
const BrowserPool = require("./BrowserPool");
const ProxyManager = require("./ProxyManager");
const imageQueue = require("../queues/imageQueue");
const listingQueue = require("../queues/listingQueue");
const { createSourceSemaphore } = require("../utils/concurrency");
const { getBreakerRegistry } = require("../scrapers/base/breakerRegistry");

// Map sourceKey -> canonical sourceName (fixes legacy typos like pigianme).
const SOURCE_NAME_ALIASES = {
  jiji: "jiji",
  pigiame: "pigiame",
  pigianme: "pigiame",
  airbnb: "airbnb",
  booking: "booking",
  vrbo: "vrbo",
  buyrent: "buyrent",
  property24: "property24",
  kenyapropertycentre: "kenyapropertycentre",
  hauzisha: "hauzisha",
};

function resolveSourceName(key) {
  return SOURCE_NAME_ALIASES[key] || key;
}

class PropertyAggregatorService {
  constructor() {
    this.importService = new PropertyImportService();
    this.scrapers = {};
    this.loggers = {};
    this.scraperInstances = {};
    this.unavailableScrapers = [];
    this.enableQueueProcessing = process.env.QUEUE_ENABLED === 'true';
    this.enableParallelScraping = process.env.PARALLEL_SCRAPING_ENABLED !== 'false';
    // Bound parallel scrapers: keep total small to avoid DDoS-ing ourselves.
    const globalConcurrency = Math.max(
      1,
      parseInt(process.env.SCRAPER_GLOBAL_CONCURRENCY || '4', 10) || 4
    );
    const perKeyConcurrency = Math.max(
      1,
      parseInt(process.env.SCRAPER_PER_KEY_CONCURRENCY || '1', 10) || 1
    );
    this.semaphore = createSourceSemaphore({
      global: globalConcurrency,
      perKey: perKeyConcurrency,
    });
    this.breakers = getBreakerRegistry();
    
    for (const [key, cfg] of Object.entries(sc.sources)) {
      if (cfg.enabled) {
        try {
          const scraperPath = cfg.scraperPath || `../scrapers/${key}/scraper`;
          const ScraperClass = require(scraperPath);
          this.scraperInstances[key] = new ScraperClass();
          this.loggers[key] = new ScraperLogger(key);
        } catch (e) {
          this.unavailableScrapers.push(key);
        }
      }
    }

    if (this.unavailableScrapers.length > 0) {
      console.warn("[Aggregator] Skipping unavailable scrapers:", this.unavailableScrapers.join(", "));
    }
  }

  /**
   * Aggregate all sources with a global + per-source concurrency limit.
   * Each scraper runs until its source is exhausted. Results are saved to database.
   */
  async aggregateAllSources() {
    console.log("[Aggregator] Starting parallel aggregation of all sources...");

    const startTime = Date.now();
    const scraperEntries = Object.entries(this.scraperInstances);
    const targetListings = Math.max(0, parseInt(process.env.SCRAPER_TARGET_LISTINGS || "500000", 10) || 0);
    const perSourceTarget = targetListings > 0 && scraperEntries.length > 0 ? Math.ceil(targetListings / scraperEntries.length) : Infinity;

    if (scraperEntries.length === 0) {
      console.warn("[Aggregator] No scrapers configured");
      return {};
    }

    // Run all scrapers through the semaphore (global + per-source caps).
    const scrapePromises = scraperEntries.map(([key, scraper]) =>
      this.semaphore.run(key, () => this._scrapeSingleSource(key, scraper, perSourceTarget))
    );

    const settledResults = await Promise.allSettled(scrapePromises);

    // Process results
    const results = {};
    for (let i = 0; i < settledResults.length; i++) {
      const [key] = scraperEntries[i];
      const settled = settledResults[i];

      if (settled.status === 'fulfilled') {
        results[key] = settled.value;
      } else {
        console.error(`[Aggregator] Scraper ${key} failed:`, settled.reason?.message);
        results[key] = { source: key, status: "failed", error: settled.reason?.message };
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[Aggregator] Parallel aggregation completed in ${totalDuration}ms`);
    console.log(`[Aggregator] Breaker snapshot:`, this.breakers.snapshot());

    // Clean up browser pool
    try {
      await BrowserPool.closeBrowser();
    } catch (e) {
      console.warn('[Aggregator] Error closing browser:', e.message);
    }

    return results;
  }

  /**
   * Scrape a single source until exhaustion and import
   */
  async _scrapeSingleSource(key, scraper, maxListings = Infinity) {
    const startTime = Date.now();
    console.log(`[Aggregator] Scraping ${key}...`);
    
    try {
      // Scrape each enabled source until its pagination is exhausted.
      const scrapeResult = await scraper.scrape({ maxListings });
      
      const listings = Array.isArray(scrapeResult.listings) ? scrapeResult.listings : [];
      
      // If queue processing is enabled, add listings to the pipeline
      if (this.enableQueueProcessing && listings.length > 0) {
        await this._processViaQueue(listings, key, scrapeResult);
      }
      
      // Import scraped properties to the database
      console.log(`[Aggregator] Importing ${listings.length} properties from ${key}...`);
      const importResult = await this.importService.import(listings, key);
      
      await this.loggers[key].logScrapeRun({
        ...scrapeResult,
        ...importResult,
        sourceName: resolveSourceName(key),
        usedPuppeteer: !!sc.sources[key]?.usePuppeteer,
      });
      
      const result = {
        source: key,
        sourceName: resolveSourceName(key),
        status: scrapeResult.status,
        listingsFound: scrapeResult.listingsFound,
        listingsImported: importResult.imported,
        listingsUpdated: importResult.updated,
        durationMs: Date.now() - startTime,
        errors: scrapeResult.errors,
      };
      
      console.log(`[Aggregator] ${key} completed: ${importResult.imported} imported, ${importResult.updated} updated, ${importResult.failed} failed`);
      
      return result;
    } catch (e) {
      console.error(`[Aggregator] Error scraping ${key}:`, e.message);
      if (this.loggers[key]) {
        await this.loggers[key].logError("scrape", e).catch(() => {});
      }
      throw e;
    }
  }

  /**
   * Process listings through the queue pipeline
   * Pipeline: listingQueue -> detailQueue -> imageQueue -> duplicateQueue -> aiQueue -> rankingQueue
   */
  async _processViaQueue(listings, sourceKey, scrapeResult) {
    try {
      const listingUrls = scrapeResult.urls || [];
      const sourceConfig = sc.sources[sourceKey] || {};
      
      // Add listing URLs to the queue
      if (listingUrls.length > 0) {
        await listingQueue.addJob({
          sourceKey,
          listingUrls,
          sourceConfig
        });
      }
      
      // Add individual properties to the image queue for validation
      for (const property of listings) {
        if (property && property.propertyID) {
          await imageQueue.addJob({
            property,
            sourceKey,
            url: property.sourceURL || ''
          });
        }
      }
    } catch (error) {
      console.warn(`[Aggregator] Queue processing error for ${sourceKey}:`, error.message);
    }
  }

  /**
   * Get the status of all scrapers
   */
  getStatus() {
    const status = {
      totalSources: Object.keys(this.scraperInstances).length,
      enabledSources: Object.keys(this.scraperInstances).length,
      queueEnabled: this.enableQueueProcessing,
      parallelEnabled: this.enableParallelScraping,
      proxyEnabled: ProxyManager.isEnabled(),
      cacheSize: CacheManager.getStats().size,
      sources: {}
    };

    for (const [key, cfg] of Object.entries(sc.sources)) {
      if (cfg.enabled) {
        status.sources[key] = {
          name: cfg.name,
          category: cfg.category || 'listing',
          enabled: true,
          usePuppeteer: cfg.usePuppeteer || false
        };
      }
    }

    return status;
  }
}

module.exports = PropertyAggregatorService;
