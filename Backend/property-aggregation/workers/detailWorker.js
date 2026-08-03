/**
 * Detail Worker - Processes property detail scraping from the detail queue.
 * Scrapes full property details from listing URLs and adds to image queue.
 */
const detailQueue = require('../queues/detailQueue');
const imageQueue = require('../queues/imageQueue');
const CacheManager = require('../services/CacheManager');

async function processDetail(job) {
  const { sourceKey, url, sourceConfig } = job.data;
  console.log(`[DetailWorker] Scraping detail: ${url}`);

  try {
    // Load the appropriate scraper
    const ScraperClass = require(`../scrapers/${sourceKey}/scraper`);
    const scraper = new ScraperClass();
    
    // Scrape property detail
    const property = await scraper.scrapePropertyDetail(url);
    
    if (property && property.propertyID) {
      // Check if property was already imported
      const exists = await CacheManager.hasPropertyId(property.propertyID);
      if (!exists) {
        // Add to image queue for validation
        await imageQueue.addJob({
          property,
          sourceKey,
          url
        });
        await CacheManager.cachePropertyId(property.propertyID);
      }
    }
    
    return { url, scraped: !!property };
  } catch (error) {
    console.error(`[DetailWorker] Error scraping ${url}:`, error.message);
    throw error;
  }
}

(async () => {
  try {
    const queue = await detailQueue.getQueue();
    if (queue.process) queue.process(processDetail);
  } catch (e) { console.warn('[DetailWorker] Could not register processor:', e.message); }
})();

module.exports = { processDetail };